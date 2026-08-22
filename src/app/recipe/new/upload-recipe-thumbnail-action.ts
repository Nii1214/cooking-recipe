"use server";

/**
 * サムネイル保存の入口。全体の読み方:
 * @see src/app/recipe/new/レシピ新規と画像.md
 *
 * 処理の流れ: 認証・レート制限・監査 → usecase（ルール・リサイズ）→ infrastructure（Storage Put）
 */

import { createAuthedClient } from "@/lib/supabase/server";
import {
  assertRecipeThumbnailUploadRateLimit,
  logRecipeThumbnailUploadAudit,
} from "@/lib/recipe-thumbnail-upload-controls";
import { recipeThumbnailImageProcessorImpl } from "@/infrastructure/image/recipe-thumbnail-image-processor-impl";
import { recipeThumbnailStorageImpl } from "@/infrastructure/storage/recipe-thumbnail-storage-impl";
import { uploadRecipeThumbnailUsecase } from "@/usecase/recipe/upload-recipe-thumbnail-usecase";

const FILE_FIELD = "file";

export type UploadRecipeThumbnailActionResult =
  | { success: true; path: string }
  | { success: false; error: string };

/**
 * レシピサムネイルをサーバー経由で Supabase Storage に保存する。
 *
 * @param formData `file` フィールドに画像を含むフォーム
 * @returns 成功時は保存パス、失敗時はエラーメッセージ
 */
export async function uploadRecipeThumbnailAction(
  formData: FormData,
): Promise<UploadRecipeThumbnailActionResult> {
  let userId: string | undefined;

  try {
    const { user } = await createAuthedClient();
    userId = user.id;
  } catch {
    logRecipeThumbnailUploadAudit({ event: "reject_unauthorized" });
    return { success: false, error: "ログインが必要です" };
  }

  const raw = formData.get(FILE_FIELD);
  if (!(raw instanceof File)) {
    logRecipeThumbnailUploadAudit({
      event: "reject_empty_file",
      userId,
      message: "missing_or_invalid_file_field",
    });
    return { success: false, error: "画像ファイルを選択してください" };
  }

  try {
    assertRecipeThumbnailUploadRateLimit(userId);
  } catch (e) {
    if (e instanceof Error && e.message === "RATE_LIMIT_EXCEEDED") {
      logRecipeThumbnailUploadAudit({
        event: "reject_rate_limit",
        userId,
      });
      return {
        success: false,
        error:
          "画像アップロードの上限に達しました。しばらく時間をおいてからお試しください。",
      };
    }
    throw e;
  }

  logRecipeThumbnailUploadAudit({
    event: "attempt",
    userId,
    contentType: raw.type,
    byteSize: raw.size,
  });

  let body: Uint8Array;
  try {
    const ab = await raw.arrayBuffer();
    body = new Uint8Array(ab);
  } catch (e) {
    const message = e instanceof Error ? e.message : "read_failed";
    logRecipeThumbnailUploadAudit({
      event: "error",
      userId,
      message,
    });
    return { success: false, error: "画像の読み込みに失敗しました" };
  }

  const result = await uploadRecipeThumbnailUsecase(
    {
      authorId: userId,
      body,
      contentType: raw.type || "application/octet-stream",
    },
    {
      storage: recipeThumbnailStorageImpl,
      imageProcessor: recipeThumbnailImageProcessorImpl,
    },
  );

  if (!result.success) {
    logRecipeThumbnailUploadAudit({
      event: "reject_validation",
      userId,
      byteSize: body.byteLength,
      contentType: raw.type,
      message: result.error,
    });
    return result;
  }

  logRecipeThumbnailUploadAudit({
    event: "success",
    userId,
    byteSize: body.byteLength,
    contentType: raw.type,
    path: result.path,
  });

  return result;
}
