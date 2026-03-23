-- =============================================================================
-- recipe-images ストレージバケットの作成と RLS ポリシー
-- =============================================================================

-- バケットを作成（既に存在する場合はスキップ）
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recipe-images',
  'recipe-images',
  true,
  5242880, -- 5MiB in bytes
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- 既存ポリシーを削除してから再作成（べき等性を確保）
drop policy if exists "authenticated users can upload recipe images" on storage.objects;
drop policy if exists "users can update own recipe images" on storage.objects;
drop policy if exists "users can delete own recipe images" on storage.objects;

-- 認証済みユーザーは全員アップロード可能（自分の {userId}/ プレフィックス配下のみ）
create policy "authenticated users can upload recipe images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- アップロードしたユーザー本人のみ更新可能
create policy "users can update own recipe images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- アップロードしたユーザー本人のみ削除可能
create policy "users can delete own recipe images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- バケットは public = true のため SELECT（閲覧）は全員可能（ポリシー不要）
