-- =============================================================================
-- categories テーブル（マスターデータ）
-- =============================================================================

create table categories (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  slug       text        not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

create policy "authenticated users can select categories"
  on categories for select
  using (auth.uid() is not null);

create policy "no direct insert on categories"
  on categories for insert
  with check (false);

create policy "no direct update on categories"
  on categories for update
  using (false);

create policy "no direct delete on categories"
  on categories for delete
  using (false);

-- =============================================================================
-- ingredients テーブル（材料マスターデータ）
-- ingredient_id を recipe_ingredients と紐付けることで将来の材料検索に対応する
-- =============================================================================

create table ingredients (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  -- normalized_name: 検索・突合せ用（小文字化・空白除去・表記ゆれ統一後の文字列）
  normalized_name text        not null,
  created_at      timestamptz not null default now()
);

-- normalized_name での検索に使用（UNIQUE にすることで重複登録を防ぐ）
create unique index on ingredients(normalized_name);

alter table ingredients enable row level security;

create policy "authenticated users can select ingredients"
  on ingredients for select
  using (auth.uid() is not null);

-- 書き込みはサービスロールキーで操作（正規化はサーバーサイドで管理）
create policy "no direct insert on ingredients"
  on ingredients for insert
  with check (false);

create policy "no direct update on ingredients"
  on ingredients for update
  using (false);

create policy "no direct delete on ingredients"
  on ingredients for delete
  using (false);

-- =============================================================================
-- recipes テーブル
-- =============================================================================

create table recipes (
  id                       uuid        primary key default gen_random_uuid(),
  title                    text        not null,
  description              text,
  thumbnail_url            text,
  serving_count            integer     not null check (serving_count > 0),
  preparation_time_minutes integer     not null check (preparation_time_minutes > 0),
  is_draft                 boolean     not null default true,
  author_id                uuid        not null references auth.users(id) on delete cascade,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- (author_id, is_draft) の複合インデックス:
--   「自分のレシピ一覧」「自分の下書き一覧」などの絞り込みに対応
--   author_id 単独の検索にも有効（先頭カラムのため）
create index on recipes(author_id, is_draft);

create trigger set_updated_at
  before update on recipes
  for each row
  execute function update_updated_at();

alter table recipes enable row level security;

create policy "authors can select own recipes"
  on recipes for select
  using (author_id = auth.uid());

-- EXISTS + JOIN に変更: planner が author_id インデックスを活用できる
create policy "family members can select published recipes"
  on recipes for select
  using (
    is_draft = false
    and exists (
      select 1
      from family_members fm_self
      join family_members fm_a on fm_self.family_id = fm_a.family_id
      where fm_self.user_id = auth.uid()
        and fm_a.user_id = recipes.author_id
    )
  );

create policy "authenticated users can insert recipes"
  on recipes for insert
  with check (author_id = auth.uid());

-- UPDATE / DELETE は単一行操作のため is_same_family() のパフォーマンス問題は発生しない
create policy "authors can update own recipes"
  on recipes for update
  using (author_id = auth.uid());

create policy "family members can update published recipes"
  on recipes for update
  using (
    is_draft = false
    and is_same_family(author_id)
  );

create policy "authors can delete own recipes"
  on recipes for delete
  using (author_id = auth.uid());

create policy "family members can delete published recipes"
  on recipes for delete
  using (
    is_draft = false
    and is_same_family(author_id)
  );

-- =============================================================================
-- accessible_recipe_ids ビュー
-- recipes の RLS を子テーブルから再利用するためのビュー
-- このビューを通じた SELECT には recipes の RLS が自動適用される
-- =============================================================================

create or replace view accessible_recipe_ids as
  select id from recipes;

-- =============================================================================
-- recipe_categories テーブル（中間テーブル）
-- =============================================================================

create table recipe_categories (
  recipe_id   uuid        not null references recipes(id) on delete cascade,
  category_id uuid        not null references categories(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (recipe_id, category_id)
);

create index on recipe_categories(category_id);

alter table recipe_categories enable row level security;

-- EXISTS に変更: 単一行のインデックスルックアップに最適化
create policy "users can select accessible recipe categories"
  on recipe_categories for select
  using (exists (select 1 from accessible_recipe_ids where id = recipe_categories.recipe_id));

create policy "authors can insert recipe categories"
  on recipe_categories for insert
  with check (
    exists (
      select 1 from recipes r
      where r.id = recipe_categories.recipe_id
        and r.author_id = auth.uid()
    )
  );

create policy "users can delete accessible recipe categories"
  on recipe_categories for delete
  using (exists (select 1 from accessible_recipe_ids where id = recipe_categories.recipe_id));

-- =============================================================================
-- recipe_ingredients テーブル
-- =============================================================================

create table recipe_ingredients (
  id               uuid        primary key default gen_random_uuid(),
  recipe_id        uuid        not null references recipes(id) on delete cascade,
  -- ingredient_id: 材料マスターとの紐付け（nullable: 将来の段階的な正規化に対応）
  ingredient_id    uuid        references ingredients(id) on delete set null,
  -- name: ユーザーが入力した表示用の材料名（例: "人参（みじん切り）"）
  name             text        not null,
  quantity_display text        not null,
  quantity_value   numeric,
  unit             text        not null,
  note             text,
  order_position   integer     not null check (order_position > 0),
  created_at       timestamptz not null default now()
);

create index on recipe_ingredients(recipe_id, order_position);
create index on recipe_ingredients(ingredient_id);

alter table recipe_ingredients enable row level security;

create policy "users can select accessible recipe ingredients"
  on recipe_ingredients for select
  using (exists (select 1 from accessible_recipe_ids where id = recipe_ingredients.recipe_id));

create policy "authors can insert recipe ingredients"
  on recipe_ingredients for insert
  with check (
    exists (
      select 1 from recipes r
      where r.id = recipe_ingredients.recipe_id
        and r.author_id = auth.uid()
    )
  );

create policy "users can update accessible recipe ingredients"
  on recipe_ingredients for update
  using (exists (select 1 from accessible_recipe_ids where id = recipe_ingredients.recipe_id));

create policy "users can delete accessible recipe ingredients"
  on recipe_ingredients for delete
  using (exists (select 1 from accessible_recipe_ids where id = recipe_ingredients.recipe_id));

-- =============================================================================
-- recipe_instructions テーブル
-- =============================================================================

create table recipe_instructions (
  id          uuid        primary key default gen_random_uuid(),
  recipe_id   uuid        not null references recipes(id) on delete cascade,
  step_number integer     not null check (step_number > 0),
  description text        not null,
  image_url   text,
  created_at  timestamptz not null default now(),
  -- UNIQUE 制約が (recipe_id, step_number) の複合インデックスを自動作成
  -- recipe_id 先頭カラムのため単独検索にも有効
  unique (recipe_id, step_number)
);

alter table recipe_instructions enable row level security;

create policy "users can select accessible recipe instructions"
  on recipe_instructions for select
  using (exists (select 1 from accessible_recipe_ids where id = recipe_instructions.recipe_id));

create policy "authors can insert recipe instructions"
  on recipe_instructions for insert
  with check (
    exists (
      select 1 from recipes r
      where r.id = recipe_instructions.recipe_id
        and r.author_id = auth.uid()
    )
  );

create policy "users can update accessible recipe instructions"
  on recipe_instructions for update
  using (exists (select 1 from accessible_recipe_ids where id = recipe_instructions.recipe_id));

create policy "users can delete accessible recipe instructions"
  on recipe_instructions for delete
  using (exists (select 1 from accessible_recipe_ids where id = recipe_instructions.recipe_id));

-- =============================================================================
-- recipe_summaries ビュー
-- レシピ一覧画面向けの集約ビュー。recipes の RLS が自動適用される
-- group by r.id: r.id が PK のため他カラムの関数従属性が保証される（PostgreSQL 有効）
-- =============================================================================

create or replace view recipe_summaries as
  select
    r.id,
    r.title,
    r.description,
    r.thumbnail_url,
    r.serving_count,
    r.preparation_time_minutes,
    r.is_draft,
    r.author_id,
    r.created_at,
    r.updated_at,
    coalesce(
      json_agg(
        json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)
        order by c.name
      ) filter (where c.id is not null),
      '[]'
    ) as categories
  from recipes r
  left join recipe_categories rc on rc.recipe_id = r.id
  left join categories c on c.id = rc.category_id
  group by r.id;
