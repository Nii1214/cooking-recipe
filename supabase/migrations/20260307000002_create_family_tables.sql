create table families (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  owner_id   uuid        not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- owner_id は UPDATE ポリシーの条件で使用
create index on families(owner_id);

create table family_members (
  family_id uuid        not null references families(id) on delete cascade,
  user_id   uuid        not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
  -- family_id は PK 先頭カラムのため単独インデックスは不要
);

create index on family_members(user_id);

-- =============================================================================
-- ヘルパー関数
-- security definer + set search_path で RLS 再帰と Schema Poisoning を防ぐ
-- =============================================================================

create or replace function get_my_family_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select family_id
  from family_members
  where user_id = auth.uid();
$$;

-- nested EXISTS で短絡評価: 複数家族所属時に最初のマッチで終了する
create or replace function is_same_family(p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from family_members fm_a
    where fm_a.user_id = p_user_id
      and exists (
        select 1
        from family_members fm_b
        where fm_b.family_id = fm_a.family_id
          and fm_b.user_id = auth.uid()
      )
  );
$$;

-- =============================================================================
-- RLS: families
-- =============================================================================

alter table families enable row level security;

create policy "members can select own families"
  on families for select
  using (id in (select get_my_family_ids()));

create policy "authenticated users can insert families"
  on families for insert
  with check (auth.uid() is not null);

create policy "owner can update family"
  on families for update
  using (owner_id = auth.uid());

-- =============================================================================
-- RLS: family_members
-- =============================================================================

alter table family_members enable row level security;

create policy "members can select family members"
  on family_members for select
  using (family_id in (select get_my_family_ids()));

create policy "users can join families"
  on family_members for insert
  with check (user_id = auth.uid());

create policy "users can leave families"
  on family_members for delete
  using (user_id = auth.uid());
