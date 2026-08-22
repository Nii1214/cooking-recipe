// npm run test:run -- src/lib/site-url.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { headers } from "next/headers";
import { getSiteOrigin } from "./site-url";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

/**
 * Headers のモックを組み立てる
 *
 * @param values ヘッダー名と値の組
 * @returns headers() の戻り値として使えるモック
 */
function mockHeaders(values: Record<string, string>) {
  vi.mocked(headers).mockResolvedValue({
    get: (name: string) => values[name.toLowerCase()] ?? null,
  } as unknown as Awaited<ReturnType<typeof headers>>);
}

describe("getSiteOrigin", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_SITE_URL;
    mockHeaders({});
  });

  afterEach(() => {
    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      return;
    }
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it("NEXT_PUBLIC_SITE_URL があればそれを使う", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://recipe.example.com";
    mockHeaders({ host: "localhost:3000" });

    await expect(getSiteOrigin()).resolves.toBe("https://recipe.example.com");
  });

  it("NEXT_PUBLIC_SITE_URL の末尾スラッシュとパスを取り除く", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://recipe.example.com/";

    await expect(getSiteOrigin()).resolves.toBe("https://recipe.example.com");
  });

  it("スキーム省略時は https を補う", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "recipe.example.com";

    await expect(getSiteOrigin()).resolves.toBe("https://recipe.example.com");
  });

  it("未設定ならリクエストのホストから組み立てる", async () => {
    mockHeaders({ host: "recipe.example.com", "x-forwarded-proto": "https" });

    await expect(getSiteOrigin()).resolves.toBe("https://recipe.example.com");
  });

  it("x-forwarded-host を host より優先する", async () => {
    mockHeaders({
      host: "internal:3000",
      "x-forwarded-host": "recipe.example.com",
      "x-forwarded-proto": "https",
    });

    await expect(getSiteOrigin()).resolves.toBe("https://recipe.example.com");
  });

  it("x-forwarded-proto がカンマ区切りでも先頭を使う", async () => {
    mockHeaders({ host: "recipe.example.com", "x-forwarded-proto": "https,http" });

    await expect(getSiteOrigin()).resolves.toBe("https://recipe.example.com");
  });

  it("ローカルホストはプロトコル未指定でも http にする", async () => {
    mockHeaders({ host: "localhost:3000" });

    await expect(getSiteOrigin()).resolves.toBe("http://localhost:3000");
  });

  it("ホストが取れない場合は localhost にフォールバックする", async () => {
    mockHeaders({});

    await expect(getSiteOrigin()).resolves.toBe("http://localhost:3000");
  });
});
