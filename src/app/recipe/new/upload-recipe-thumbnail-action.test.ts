// npm run test:run -- src/app/recipe/new/upload-recipe-thumbnail-action.test.ts
// npm run test:coverage -- --coverage.include='src/app/recipe/new/upload-recipe-thumbnail-action.ts' src/app/recipe/new/upload-recipe-thumbnail-action.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadRecipeThumbnailAction } from "./upload-recipe-thumbnail-action";
import { createAuthedClient } from "@/lib/supabase/server";
import { uploadRecipeThumbnailUsecase } from "@/usecase/recipe/upload-recipe-thumbnail-usecase";
import { assertRecipeThumbnailUploadRateLimit } from "@/lib/recipe-thumbnail-upload-controls";

vi.mock("@/lib/supabase/server", () => ({
  createAuthedClient: vi.fn(),
}));

vi.mock("@/usecase/recipe/upload-recipe-thumbnail-usecase", () => ({
  uploadRecipeThumbnailUsecase: vi.fn(),
}));

vi.mock("@/lib/recipe-thumbnail-upload-controls", () => ({
  assertRecipeThumbnailUploadRateLimit: vi.fn(),
  logRecipeThumbnailUploadAudit: vi.fn(),
}));

vi.mock("@/infrastructure/storage/recipe-thumbnail-storage-impl", () => ({
  recipeThumbnailStorageImpl: { put: vi.fn() },
}));

vi.mock("@/infrastructure/image/recipe-thumbnail-image-processor-impl", () => ({
  recipeThumbnailImageProcessorImpl: { toStorable: vi.fn() },
}));

describe("uploadRecipeThumbnailAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assertRecipeThumbnailUploadRateLimit).mockImplementation(() => {});
    vi.mocked(createAuthedClient).mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    vi.mocked(uploadRecipeThumbnailUsecase).mockResolvedValue({
      success: true,
      path: "user-1/abc.webp",
    });
  });

  it("未ログイン時はエラーを返す", async () => {
    vi.mocked(createAuthedClient).mockRejectedValue(new Error("UNAUTHORIZED"));

    const result = await uploadRecipeThumbnailAction(new FormData());

    expect(result).toEqual({ success: false, error: "ログインが必要です" });
  });

  it("ファイル未選択時はエラーを返す", async () => {
    const result = await uploadRecipeThumbnailAction(new FormData());

    expect(result).toEqual({
      success: false,
      error: "画像ファイルを選択してください",
    });
  });

  it("レート制限超過時はエラーを返す", async () => {
    vi.mocked(assertRecipeThumbnailUploadRateLimit).mockImplementation(() => {
      throw new Error("RATE_LIMIT_EXCEEDED");
    });
    const formData = new FormData();
    formData.append(
      "file",
      new File([new Uint8Array([1, 2, 3])], "a.jpg", { type: "image/jpeg" }),
    );

    const result = await uploadRecipeThumbnailAction(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("上限に達しました");
    }
  });

  it("成功時は path を返す", async () => {
    const formData = new FormData();
    formData.append(
      "file",
      new File([new Uint8Array([1, 2, 3])], "a.jpg", { type: "image/jpeg" }),
    );

    const result = await uploadRecipeThumbnailAction(formData);

    expect(result).toEqual({
      success: true,
      path: "user-1/abc.webp",
    });
  });

  it("usecase バリデーション失敗時はエラーを返す", async () => {
    vi.mocked(uploadRecipeThumbnailUsecase).mockResolvedValue({
      success: false,
      error: "画像ファイルが空です",
    });
    const formData = new FormData();
    formData.append(
      "file",
      new File([], "empty.jpg", { type: "image/jpeg" }),
    );

    const result = await uploadRecipeThumbnailAction(formData);

    expect(result).toEqual({ success: false, error: "画像ファイルが空です" });
  });

  it("arrayBuffer 読み込み失敗時はエラーを返す", async () => {
    const badFile = new File([new Uint8Array([1])], "a.jpg", {
      type: "image/jpeg",
    });
    vi.spyOn(badFile, "arrayBuffer").mockRejectedValue(new Error("read error"));

    const formData = new FormData();
    formData.append("file", badFile);

    const result = await uploadRecipeThumbnailAction(formData);

    expect(result).toEqual({
      success: false,
      error: "画像の読み込みに失敗しました",
    });
  });

  it("contentType 未設定時は application/octet-stream を渡す", async () => {
    const formData = new FormData();
    const file = new File([new Uint8Array([1, 2, 3])], "a.jpg", { type: "" });
    formData.append("file", file);

    await uploadRecipeThumbnailAction(formData);

    expect(uploadRecipeThumbnailUsecase).toHaveBeenCalledWith(
      expect.objectContaining({ contentType: "application/octet-stream" }),
      expect.anything(),
    );
  });

  it("arrayBuffer 読み込み失敗（Error 以外）はエラーを返す", async () => {
    const badFile = new File([new Uint8Array([1])], "a.jpg", {
      type: "image/jpeg",
    });
    vi.spyOn(badFile, "arrayBuffer").mockRejectedValue("read fail");

    const formData = new FormData();
    formData.append("file", badFile);

    const result = await uploadRecipeThumbnailAction(formData);

    expect(result).toEqual({
      success: false,
      error: "画像の読み込みに失敗しました",
    });
  });

  it("レート制限以外の assert エラーは再 throw する", async () => {
    vi.mocked(assertRecipeThumbnailUploadRateLimit).mockImplementation(() => {
      throw new Error("OTHER");
    });
    const formData = new FormData();
    formData.append(
      "file",
      new File([new Uint8Array([1])], "a.jpg", { type: "image/jpeg" }),
    );

    await expect(uploadRecipeThumbnailAction(formData)).rejects.toThrow("OTHER");
  });
});
