"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createAuthedClient } from "@/lib/supabase/server";

/** プレサインド URL の有効期限（秒）*/
const PRESIGNED_URL_EXPIRES_IN = 300; // 5 分

type GetUploadUrlResult =
  | { success: true; presignedUrl: string; path: string }
  | { success: false; error: string };

/**
 * S3 へのアップロード用プレサインド URL とパスを返す Server Action。
 *
 * 流れ:
 * 1. サーバー側でプレサインド URL を生成（AWS 認証情報はサーバーのみ保持）
 * 2. クライアントは受け取ったプレサインド URL に対して直接 PUT リクエストを送信
 * 3. アップロード後、返された path を createRecipeAction に渡して DB に保存
 *
 * @param filename - アップロードするファイルの元のファイル名（拡張子を取得するために使用）
 * @param contentType - MIME タイプ（例: "image/jpeg"）
 */
export async function getUploadUrlAction(
  filename: string,
  contentType: string
): Promise<GetUploadUrlResult> {
  try {
    const { user } = await createAuthedClient();

    const region = process.env.AWS_REGION;
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!region || !bucket || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "AWS の設定が不足しています。.env.local を確認してください。"
      );
    }

    const ext = filename.split(".").pop() ?? "jpg";
    const path = `recipes/${user.id}/${crypto.randomUUID()}.${ext}`;

    const s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    const presignedUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: path,
        ContentType: contentType,
      }),
      { expiresIn: PRESIGNED_URL_EXPIRES_IN }
    );

    return { success: true, presignedUrl, path };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "アップロード URL の取得に失敗しました";
    return { success: false, error: message };
  }
}
