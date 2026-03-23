/**
 * プレサインド URL を使って S3 に画像を直接アップロードする。
 *
 * ブラウザから直接 S3 に PUT リクエストを送るため、
 * AWS の認証情報はサーバー（get-upload-url-action.ts）のみに存在し、
 * クライアントには漏れない。
 *
 * @param file         - アップロードするファイル
 * @param presignedUrl - サーバーが発行したプレサインド URL
 */
export async function uploadRecipeImage(
  file: File,
  presignedUrl: string
): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!res.ok) {
    throw new Error(`S3 へのアップロードに失敗しました (HTTP ${res.status})`);
  }
}
