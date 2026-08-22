import sharp from "sharp";
import type {
  RecipeThumbnailImageProcessor,
  StorableRecipeThumbnail,
} from "@/domain/repositories/recipe/recipe-thumbnail-image-processor";
import {
  RECIPE_THUMBNAIL_MAX_EDGE_PX,
  RECIPE_THUMBNAIL_STORED_CONTENT_TYPE,
  RECIPE_THUMBNAIL_STORED_EXTENSION,
  RECIPE_THUMBNAIL_WEBP_QUALITY,
} from "@/constants/recipe-thumbnail-upload";

/**
 * サムネイルを長辺 1200px 以内の WebP に変換する。
 * スマホ写真の向きは EXIF に従い、小さい画像は拡大しない。
 *
 * @param body アップロードされた画像のバイト列
 * @returns 変換後のバイト列と Content-Type・拡張子
 */
export const toStorableRecipeThumbnail = async (
  body: Uint8Array,
): Promise<StorableRecipeThumbnail> => {
  const output = await sharp(body)
    .rotate()
    .resize({
      width: RECIPE_THUMBNAIL_MAX_EDGE_PX,
      height: RECIPE_THUMBNAIL_MAX_EDGE_PX,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: RECIPE_THUMBNAIL_WEBP_QUALITY })
    .toBuffer();

  return {
    body: new Uint8Array(output),
    contentType: RECIPE_THUMBNAIL_STORED_CONTENT_TYPE,
    extension: RECIPE_THUMBNAIL_STORED_EXTENSION,
  };
};

export const recipeThumbnailImageProcessorImpl: RecipeThumbnailImageProcessor = {
  toStorable: toStorableRecipeThumbnail,
};
