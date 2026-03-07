-- =============================================================================
-- ユーティリティ関数
-- 他のマイグレーションファイルから参照されるため、最初に作成する
-- =============================================================================

-- updated_at 自動更新トリガー関数
-- UPDATE 時に updated_at を now() にセットする。trigger としてアタッチして使う
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
