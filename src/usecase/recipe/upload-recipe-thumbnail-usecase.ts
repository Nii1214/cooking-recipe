import {
  isAllowedRecipeThumbnailContentType,
  RECIPE_THUMBNAIL_MAX_BYTES,
} from "@/constants/recipe-thumbnail-upload";
import type { RecipeThumbnailImageProcessor } from "@/domain/repositories/recipe/recipe-thumbnail-image-processor";
import type { RecipeThumbnailStorage } from "@/domain/repositories/recipe/recipe-thumbnail-storage";

export type UploadRecipeThumbnailInput = {
  authorId: string;
  body: Uint8Array;
  contentType: string;
};

export type UploadRecipeThumbnailDeps = {
  storage: RecipeThumbnailStorage;
  imageProcessor: RecipeThumbnailImageProcessor;
};

export type UploadRecipeThumbnailResult =
  | { success: true; path: string }
  | { success: false; error: string };

/**
 * レシピサムネイルのアップロード（バリデーション → リサイズ → ストレージへ委譲）。
 *
 * @param input 作者 ID と画像バイト列
 * @param deps 変換と保存の実装
 * @returns 成功時は保存パス、失敗時はエラーメッセージ
 */
export const uploadRecipeThumbnailUsecase = async (
  input: UploadRecipeThumbnailInput,
  deps: UploadRecipeThumbnailDeps,
): Promise<UploadRecipeThumbnailResult> => {
  if (input.body.byteLength === 0) {
    return { success: false, error: "画像ファイルが空です" };
  }

  if (input.body.byteLength > RECIPE_THUMBNAIL_MAX_BYTES) {
    return {
      success: false,
      error: `画像は ${Math.floor(RECIPE_THUMBNAIL_MAX_BYTES / (1024 * 1024))}MB 以下にしてください`,
    };
  }

  if (!isAllowedRecipeThumbnailContentType(input.contentType)) {
    return {
      success: false,
      error: "対応していない画像形式です（JPEG / PNG / WebP / GIF のみ）",
    };
  }

  try {
    const processed = await deps.imageProcessor.toStorable(input.body);
    const { path } = await deps.storage.put({
      authorId: input.authorId,
      body: processed.body,
      contentType: processed.contentType,
      extension: processed.extension,
    });
    return { success: true, path };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "画像の保存に失敗しました";
    return { success: false, error: message };
  }
};
