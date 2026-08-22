// npm run test:run -- src/lib/get-signed-image-url.test.ts
// npm run test:coverage -- --coverage.include='src/lib/get-signed-image-url.ts' src/lib/get-signed-image-url.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { RECIPE_THUMBNAIL_BUCKET } from "@/constants/recipe-thumbnail-upload";
import { getSignedImageUrl } from "./get-signed-image-url";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("getSignedImageUrl", () => {
  const mockCreateSignedUrl = vi.fn();
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed-url" },
      error: null,
    });
    mockFrom.mockReturnValue({ createSignedUrl: mockCreateSignedUrl });
    vi.mocked(createClient).mockResolvedValue({
      storage: { from: mockFrom },
    } as never);
  });

  it("署名 URL を返す", async () => {
    const url = await getSignedImageUrl("user-1/img.webp");

    expect(url).toBe("https://signed-url");
    expect(mockFrom).toHaveBeenCalledWith(RECIPE_THUMBNAIL_BUCKET);
    expect(mockCreateSignedUrl).toHaveBeenCalledWith("user-1/img.webp", 3600);
  });

  it("Storage エラー時は undefined を返す", async () => {
    mockCreateSignedUrl.mockResolvedValue({
      data: null,
      error: { message: "not found" },
    });

    await expect(getSignedImageUrl("missing.webp")).resolves.toBeUndefined();
  });

  it("signedUrl が空のときは undefined を返す", async () => {
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "" },
      error: null,
    });

    await expect(getSignedImageUrl("user-1/img.webp")).resolves.toBeUndefined();
  });

  it("クライアント生成に失敗したら undefined を返す", async () => {
    vi.mocked(createClient).mockRejectedValue(new Error("no session"));

    await expect(getSignedImageUrl("user-1/img.webp")).resolves.toBeUndefined();
  });
});
