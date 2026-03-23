-- =============================================================================
-- recipe_favorites テーブル
-- ユーザーごとのお気に入りレシピを管理する
-- =============================================================================

create table recipe_favorites (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  recipe_id  uuid        not null references recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

-- recipe_id での逆引きに使用
create index on recipe_favorites(recipe_id);

alter table recipe_favorites enable row level security;

-- 自分のお気に入りのみ参照可能
create policy "users can select own favorites"
  on recipe_favorites for select
  using (user_id = auth.uid());

-- 自分のお気に入りのみ追加可能
create policy "users can insert own favorites"
  on recipe_favorites for insert
  with check (user_id = auth.uid());

-- 自分のお気に入りのみ削除可能
create policy "users can delete own favorites"
  on recipe_favorites for delete
  using (user_id = auth.uid());
