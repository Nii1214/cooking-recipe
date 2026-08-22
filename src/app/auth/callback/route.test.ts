// npm run test:run -- src/app/auth/callback/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GET } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/site-url", () => ({
  getSiteOrigin: vi.fn().mockResolvedValue("https://example.com"),
}));

type MockAuth = {
  exchangeCodeForSession: ReturnType<typeof vi.fn>;
  verifyOtp: ReturnType<typeof vi.fn>;
};

/**
 * クエリ文字列から Route Handler に渡すリクエストを組み立てる
 *
 * @param query コールバックに付与するクエリ文字列
 * @returns GET に渡せる最小限のリクエスト
 */
function buildRequest(query: string): NextRequest {
  return {
    url: `https://example.com/auth/callback${query}`,
  } as NextRequest;
}

describe("GET /auth/callback", () => {
  let mockAuth: MockAuth;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth = {
      exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
      verifyOtp: vi.fn().mockResolvedValue({ error: null }),
    };
    vi.mocked(createClient).mockResolvedValue({
      auth: mockAuth,
    } as unknown as Awaited<ReturnType<typeof createClient>>);
  });

  it("code を受け取るとセッションを確立して /top へリダイレクトする", async () => {
    const response = await GET(buildRequest("?code=auth-code"));

    expect(mockAuth.exchangeCodeForSession).toHaveBeenCalledWith("auth-code");
    expect(response.headers.get("location")).toBe("https://example.com/top");
  });

  it("next クエリがあればその画面へリダイレクトする", async () => {
    const response = await GET(buildRequest("?code=auth-code&next=/recipe/new"));

    expect(response.headers.get("location")).toBe(
      "https://example.com/recipe/new",
    );
  });

  it("外部 URL への next は無視して /top へリダイレクトする", async () => {
    const response = await GET(
      buildRequest("?code=auth-code&next=//evil.example.com"),
    );

    expect(response.headers.get("location")).toBe("https://example.com/top");
  });

  it("token_hash 形式のリンクでも検証する", async () => {
    const response = await GET(
      buildRequest("?token_hash=hash-value&type=signup"),
    );

    expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
      type: "signup",
      token_hash: "hash-value",
    });
    expect(response.headers.get("location")).toBe("https://example.com/top");
  });

  it("Supabase 側でエラーが付いていればログイン画面へ戻す", async () => {
    const response = await GET(buildRequest("?error=access_denied"));

    expect(mockAuth.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "https://example.com/login?authError=1",
    );
  });

  it("code の交換に失敗したらログイン画面へ戻す", async () => {
    mockAuth.exchangeCodeForSession.mockResolvedValue({
      error: new Error("invalid code"),
    });

    const response = await GET(buildRequest("?code=expired-code"));

    expect(response.headers.get("location")).toBe(
      "https://example.com/login?authError=1",
    );
  });

  it("パラメータが無い場合はログイン画面へ戻す", async () => {
    const response = await GET(buildRequest(""));

    expect(response.headers.get("location")).toBe(
      "https://example.com/login?authError=1",
    );
  });
});
