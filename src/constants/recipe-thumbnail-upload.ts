/** レシピサムネイル 1 ファイルあたりの上限（バイト） */
export const RECIPE_THUMBNAIL_MAX_BYTES = 5 * 1024 * 1024;

/** 許可する Content-Type（サーバー側で再検証する） */
export const RECIPE_THUMBNAIL_ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type RecipeThumbnailAllowedContentType =
  (typeof RECIPE_THUMBNAIL_ALLOWED_CONTENT_TYPES)[number];

export function isAllowedRecipeThumbnailContentType(
  contentType: string,
): contentType is RecipeThumbnailAllowedContentType {
  return (RECIPE_THUMBNAIL_ALLOWED_CONTENT_TYPES as readonly string[]).includes(
    contentType,
  );
}

/** 同一ユーザーあたり、ウィンドウ内で許可するアップロード試行回数 */
export const RECIPE_THUMBNAIL_UPLOAD_MAX_PER_WINDOW = 20;

/** レート制限ウィンドウ（ミリ秒） */
export const RECIPE_THUMBNAIL_UPLOAD_WINDOW_MS = 15 * 60 * 1000;

/** Supabase Storage のレシピ画像バケット名 */
export const RECIPE_THUMBNAIL_BUCKET = "recipe-images";

/** 保存時に収める長辺の上限（px）。これより大きい辺だけ縮小する */
export const RECIPE_THUMBNAIL_MAX_EDGE_PX = 1200;

/** WebP 変換の品質（0–100） */
export const RECIPE_THUMBNAIL_WEBP_QUALITY = 80;

/** 保存後の Content-Type。入力形式に関わらず WebP に揃える */
export const RECIPE_THUMBNAIL_STORED_CONTENT_TYPE = "image/webp";

/** 保存後の拡張子 */
export const RECIPE_THUMBNAIL_STORED_EXTENSION = "webp";
