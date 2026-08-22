-- =============================================================================
-- recipe-images を非公開化し、保存形式を WebP に揃える
-- S3 時代のパスは使えないため、既存の thumbnail_url は NULL 化する
-- =============================================================================

update storage.buckets
set
  public = false,
  allowed_mime_types = array['image/webp']
where id = 'recipe-images';

drop policy if exists "users can view own or family recipe images" on storage.objects;

-- 本人、または同じ家族のメンバーだけが署名 URL を発行できる
create policy "users can view own or family recipe images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'recipe-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
        and is_same_family(((storage.foldername(name))[1])::uuid)
      )
    )
  );

-- S3 パス（recipes/{authorId}/...）は Storage では読めないため、表示を壊さないようクリアする
update recipes
set thumbnail_url = null
where thumbnail_url is not null;
