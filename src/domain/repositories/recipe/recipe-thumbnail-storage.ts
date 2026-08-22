/**
 * レシピサムネイルをオブジェクトストレージへ保存する契約。
 * 実装は infrastructure（Supabase Storage 等）。
 */
export type PutRecipeThumbnailPayload = {
  authorId: string;
  body: Uint8Array;
  contentType: string;
  extension: string;
};

export type RecipeThumbnailStorage = {
  /**
   * 変換済みのサムネイルを保存する
   * @param payload 作者 ID と保存用のバイト列
   * @returns バケット内のオブジェクトパス
   */
  put: (payload: PutRecipeThumbnailPayload) => Promise<{ path: string }>;
};
