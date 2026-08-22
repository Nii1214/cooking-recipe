// npm run test:run -- src/infrastructure/storage/recipe-thumbnail-storage-impl.test.ts
// npm run test:coverage -- --coverage.include='src/infrastructure/storage/recipe-thumbnail-storage-impl.ts' src/infrastructure/storage/recipe-thumbnail-storage-impl.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthedClient } from "@/lib/supabase/server";
import { RECIPE_THUMBNAIL_BUCKET } from "@/constants/recipe-thumbnail-upload";
import { recipeThumbnailStorageImpl } from "./recipe-thumbnail-storage-impl";

vi.mock("@/lib/supabase/server", () => ({
  createAuthedClient: vi.fn(),
}));

describe("recipeThumbnailStorageImpl", () => {
  const mockUpload = vi.fn();
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpload.mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ upload: mockUpload });
    vi.mocked(createAuthedClient).mockResolvedValue({
      supabase: { storage: { from: mockFrom } },
      user: { id: "user-1" },
    } as never);
  });

  it("put は Storage にアップロードして path を返す", async () => {
    const body = new Uint8Array([1, 2, 3]);

    const result = await recipeThumbnailStorageImpl.put({
      authorId: "user-1",
      body,
      contentType: "image/webp",
      extension: "webp",
    });

    expect(result.path).toMatch(/^user-1\/.+\.webp$/);
    expect(mockFrom).toHaveBeenCalledWith(RECIPE_THUMBNAIL_BUCKET);
    expect(mockUpload).toHaveBeenCalledWith(
      result.path,
      expect.any(Buffer),
      expect.objectContaining({
        contentType: "image/webp",
        upsert: false,
      }),
    );
  });

  it("upload が失敗したら throw する", async () => {
    mockUpload.mockResolvedValue({ error: { message: "quota exceeded" } });

    await expect(
      recipeThumbnailStorageImpl.put({
        authorId: "user-1",
        body: new Uint8Array([1]),
        contentType: "image/webp",
        extension: "webp",
      }),
    ).rejects.toThrow("quota exceeded");
  });
});
