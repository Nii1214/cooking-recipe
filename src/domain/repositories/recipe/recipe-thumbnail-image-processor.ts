/**
 * レシピサムネイルを保存可能な形式へ変換する契約。
 * 実装は infrastructure（sharp 等）。
 */
export type StorableRecipeThumbnail = {
  body: Uint8Array;
  contentType: string;
  extension: string;
};

export type RecipeThumbnailImageProcessor = {
  /**
   * 入力画像を保存用に変換する
   * @param body アップロードされた画像のバイト列
   * @returns 変換後のバイト列と Content-Type・拡張子
   */
  toStorable: (body: Uint8Array) => Promise<StorableRecipeThumbnail>;
};
