import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/** プレサインド GET URL の有効期限（秒）*/
const PRESIGNED_URL_EXPIRES_IN = 3600; // 1 時間

/**
 * S3 に保存された画像パスからプレサインド GET URL を生成する（サーバー専用）。
 *
 * バケットは完全非公開のため、表示のたびにサーバーで一時 URL を発行する。
 * URL には有効期限（1 時間）が付くため、漏洩しても被害が限定的。
 *
 * ⚠️ AWS_ACCESS_KEY_ID などの秘密鍵が必要なため、Server Component / Server Action からのみ呼び出すこと。
 */
export async function getPresignedImageUrl(path: string): Promise<string> {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("AWS の設定が不足しています。.env.local を確認してください。");
  }

  const s3 = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucket, Key: path }),
    { expiresIn: PRESIGNED_URL_EXPIRES_IN }
  );
}
