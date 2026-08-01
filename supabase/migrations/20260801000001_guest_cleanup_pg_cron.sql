-- =============================================================================
-- ゲスト（匿名）ユーザー定期削除バッチ
-- pg_cron + SQL 関数。Vercel / service_role は使用しない。
-- =============================================================================

create extension if not exists pg_cron with schema pg_catalog;

-- 匿名ユーザー全件を削除し、結果を JSON で返す
create or replace function public.cleanup_anonymous_users()
returns jsonb
language plpgsql
security definer
set search_path = auth, public, pg_temp
as $$
declare
  deleted_count integer;
begin
  delete from auth.users
  where is_anonymous is true;

  get diagnostics deleted_count = row_count;

  return jsonb_build_object(
    'success', true,
    'deletedCount', deleted_count
  );
exception
  when others then
    return jsonb_build_object(
      'success', false,
      'error', sqlerrm
    );
end;
$$;

comment on function public.cleanup_anonymous_users() is
  '匿名ゲストユーザー全件を削除する。pg_cron または SQL Editor から手動実行。';

revoke all on function public.cleanup_anonymous_users() from public;
revoke all on function public.cleanup_anonymous_users() from anon, authenticated;
grant execute on function public.cleanup_anonymous_users() to postgres;

-- 6 時間おき（UTC 0, 6, 12, 18 時 = JST 9, 15, 21, 3 時）
select cron.schedule(
  'cleanup-anonymous-users',
  '0 */6 * * *',
  $$select public.cleanup_anonymous_users()$$
);
