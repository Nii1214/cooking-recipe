// npm run test:run -- src/infrastructure/image/recipe-thumbnail-image-processor-impl.test.ts
// npm run test:coverage -- --coverage.include='src/infrastructure/image/recipe-thumbnail-image-processor-impl.ts' src/infrastructure/image/recipe-thumbnail-image-processor-impl.test.ts
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import {
  RECIPE_THUMBNAIL_MAX_EDGE_PX,
  RECIPE_THUMBNAIL_STORED_CONTENT_TYPE,
  RECIPE_THUMBNAIL_STORED_EXTENSION,
} from "@/constants/recipe-thumbnail-upload";
import { recipeThumbnailImageProcessorImpl } from "./recipe-thumbnail-image-processor-impl";

/**
 * 単色 PNG を生成する
 * @param width 幅
 * @param height 高さ
 * @returns PNG のバイト列
 */
async function createPng(width: number, height: number): Promise<Uint8Array> {
  const buffer = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 200, g: 80, b: 40 },
    },
  })
    .png()
    .toBuffer();

  return new Uint8Array(buffer);
}

describe("recipeThumbnailImageProcessorImpl", () => {
  it("大きい画像は長辺を上限以内の WebP に縮小する", async () => {
    const input = await createPng(2000, 1500);

    const result = await recipeThumbnailImageProcessorImpl.toStorable(input);

    expect(result.contentType).toBe(RECIPE_THUMBNAIL_STORED_CONTENT_TYPE);
    expect(result.extension).toBe(RECIPE_THUMBNAIL_STORED_EXTENSION);

    const meta = await sharp(result.body).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(RECIPE_THUMBNAIL_MAX_EDGE_PX);
    expect(meta.height).toBe(900);
  });

  it("小さい画像は拡大しない", async () => {
    const input = await createPng(100, 80);

    const result = await recipeThumbnailImageProcessorImpl.toStorable(input);
    const meta = await sharp(result.body).metadata();

    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(100);
    expect(meta.height).toBe(80);
  });

  it("画像でないバイト列は throw する", async () => {
    await expect(
      recipeThumbnailImageProcessorImpl.toStorable(new Uint8Array([1, 2, 3])),
    ).rejects.toThrow();
  });
});
