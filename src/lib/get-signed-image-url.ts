import { RECIPE_THUMBNAIL_BUCKET } from "@/constants/recipe-thumbnail-upload";
import { createClient } from "@/lib/supabase/server";

/** 署名 GET URL の有効期限（秒） */
const SIGNED_URL_EXPIRES_IN = 3600;

/**
 * Supabase Storage に保存された画像パスから署名 URL を生成する（サーバー専用）。
 *
 * バケットは非公開のため、表示のたびにサーバーで一時 URL を発行する。
 * URL には有効期限（1 時間）が付くため、漏洩しても被害が限定的。
 * 発行時は呼び出し元セッションの RLS が効く。
 *
 * 1 枚の欠損でページ全体を落とさないため、失敗時は undefined を返す。
 *
 * @param path バケット内のオブジェクトパス
 * @returns 署名 URL。発行できない場合は undefined
 */
export async function getSignedImageUrl(
  path: string,
): Promise<string | undefined> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(RECIPE_THUMBNAIL_BUCKET)
      .createSignedUrl(path, SIGNED_URL_EXPIRES_IN);

    if (error || !data?.signedUrl) {
      return undefined;
    }

    return data.signedUrl;
  } catch {
    return undefined;
  }
}
