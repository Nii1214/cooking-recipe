// npm run test:run -- src/usecase/recipe/upload-recipe-thumbnail-usecase.test.ts
// npm run test:coverage -- --coverage.include='src/usecase/recipe/upload-recipe-thumbnail-usecase.ts' src/usecase/recipe/upload-recipe-thumbnail-usecase.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RECIPE_THUMBNAIL_MAX_BYTES } from "@/constants/recipe-thumbnail-upload";
import type { RecipeThumbnailImageProcessor } from "@/domain/repositories/recipe/recipe-thumbnail-image-processor";
import type { RecipeThumbnailStorage } from "@/domain/repositories/recipe/recipe-thumbnail-storage";
import { uploadRecipeThumbnailUsecase } from "./upload-recipe-thumbnail-usecase";

describe("uploadRecipeThumbnailUsecase", () => {
  const processed = {
    body: new Uint8Array([9, 8, 7]),
    contentType: "image/webp",
    extension: "webp",
  };

  const storage: RecipeThumbnailStorage = {
    put: vi.fn().mockResolvedValue({ path: "user-1/abc.webp" }),
  };

  const imageProcessor: RecipeThumbnailImageProcessor = {
    toStorable: vi.fn().mockResolvedValue(processed),
  };

  const deps = { storage, imageProcessor };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storage.put).mockResolvedValue({ path: "user-1/abc.webp" });
    vi.mocked(imageProcessor.toStorable).mockResolvedValue(processed);
  });

  it("空ボディは拒否する", async () => {
    const r = await uploadRecipeThumbnailUsecase(
      {
        authorId: "u1",
        body: new Uint8Array(0),
        contentType: "image/jpeg",
      },
      deps,
    );
    expect(r).toEqual({ success: false, error: "画像ファイルが空です" });
    expect(imageProcessor.toStorable).not.toHaveBeenCalled();
    expect(storage.put).not.toHaveBeenCalled();
  });

  it("サイズ超過は拒否する", async () => {
    const r = await uploadRecipeThumbnailUsecase(
      {
        authorId: "u1",
        body: new Uint8Array(RECIPE_THUMBNAIL_MAX_BYTES + 1),
        contentType: "image/jpeg",
      },
      deps,
    );
    expect(r.success).toBe(false);
    expect(r.success === false && r.error).toContain("MB");
    expect(imageProcessor.toStorable).not.toHaveBeenCalled();
    expect(storage.put).not.toHaveBeenCalled();
  });

  it("未対応 MIME は拒否する", async () => {
    const r = await uploadRecipeThumbnailUsecase(
      {
        authorId: "u1",
        body: new Uint8Array([1, 2, 3]),
        contentType: "application/pdf",
      },
      deps,
    );
    expect(r).toEqual({
      success: false,
      error: "対応していない画像形式です（JPEG / PNG / WebP / GIF のみ）",
    });
    expect(imageProcessor.toStorable).not.toHaveBeenCalled();
    expect(storage.put).not.toHaveBeenCalled();
  });

  it("検証を通すと変換してから storage.put が呼ばれる", async () => {
    const body = new Uint8Array([1, 2, 3]);
    const r = await uploadRecipeThumbnailUsecase(
      {
        authorId: "u1",
        body,
        contentType: "image/png",
      },
      deps,
    );
    expect(r).toEqual({ success: true, path: "user-1/abc.webp" });
    expect(imageProcessor.toStorable).toHaveBeenCalledWith(body);
    expect(storage.put).toHaveBeenCalledWith({
      authorId: "u1",
      body: processed.body,
      contentType: "image/webp",
      extension: "webp",
    });
  });

  it("imageProcessor が失敗したらエラーメッセージを返す", async () => {
    const failingProcessor: RecipeThumbnailImageProcessor = {
      toStorable: vi.fn().mockRejectedValue(new Error("decode failed")),
    };

    const r = await uploadRecipeThumbnailUsecase(
      {
        authorId: "u1",
        body: new Uint8Array([1, 2, 3]),
        contentType: "image/jpeg",
      },
      { storage, imageProcessor: failingProcessor },
    );

    expect(r).toEqual({ success: false, error: "decode failed" });
    expect(storage.put).not.toHaveBeenCalled();
  });

  it("storage.put が失敗したらエラーメッセージを返す", async () => {
    const failingStorage: RecipeThumbnailStorage = {
      put: vi.fn().mockRejectedValue(new Error("upload failed")),
    };

    const r = await uploadRecipeThumbnailUsecase(
      {
        authorId: "u1",
        body: new Uint8Array([1, 2, 3]),
        contentType: "image/jpeg",
      },
      { storage: failingStorage, imageProcessor },
    );

    expect(r).toEqual({ success: false, error: "upload failed" });
  });

  it("Error 以外を throw したら汎用メッセージを返す", async () => {
    const failingStorage: RecipeThumbnailStorage = {
      put: vi.fn().mockRejectedValue("unexpected"),
    };

    const r = await uploadRecipeThumbnailUsecase(
      {
        authorId: "u1",
        body: new Uint8Array([1, 2, 3]),
        contentType: "image/jpeg",
      },
      { storage: failingStorage, imageProcessor },
    );

    expect(r).toEqual({ success: false, error: "画像の保存に失敗しました" });
  });
});
