import { headers } from "next/headers";

const FALLBACK_ORIGIN = "http://localhost:3000";
const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1", "[::1]"];

/**
 * 環境変数の値をオリジン形式（scheme + host、末尾スラッシュなし）に整える
 *
 * @param value NEXT_PUBLIC_SITE_URL の値
 * @returns 正規化したオリジン。URL として解釈できない場合は null
 */
function normalizeConfiguredUrl(value: string): string | null {
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return null;
  }
}

/**
 * ホスト名がローカル開発用かどうかを判定する
 *
 * @param host Host ヘッダーの値（ポート込み）
 * @returns ローカル開発用のホストなら true
 */
function isLocalHost(host: string): boolean {
  const hostname = host.split(":")[0];
  return LOCAL_HOSTNAMES.includes(hostname);
}

/**
 * サーバー側で絶対 URL を組み立てるためのオリジンを解決する。
 *
 * NEXT_PUBLIC_SITE_URL を最優先で使う。確認メールのリンクは送信時点の
 * リクエスト元とは別の環境で開かれるため、本番では必ず環境変数で固定する。
 * 未設定時はリクエストのホストから組み立てる（ローカル開発向けのフォールバック）。
 *
 * @returns `https://example.com` 形式のオリジン
 */
export async function getSiteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    const normalized = normalizeConfiguredUrl(configured);
    if (normalized) {
      return normalized;
    }
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) {
    return FALLBACK_ORIGIN;
  }

  // プロキシ経由では "https,http" のようにカンマ区切りで届くことがある
  const forwardedProto = headerList.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || (isLocalHost(host) ? "http" : "https");

  return `${protocol}://${host}`;
}
