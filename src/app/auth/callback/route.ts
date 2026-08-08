import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import {
  AUTH_CALLBACK_ERROR_PATH,
  AUTH_CALLBACK_SUCCESS_PATH,
} from "@/constants/auth";
import { getSiteOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

const EMAIL_OTP_TYPES: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

/**
 * `next` クエリを安全な遷移先に丸める。
 * 外部ドメインへ飛ばされないよう、自サイト内の絶対パスだけを許可する。
 *
 * @param value クエリから受け取った遷移先
 * @returns 許可された遷移先パス
 */
function toSafeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return AUTH_CALLBACK_SUCCESS_PATH;
  }
  return value;
}

/**
 * クエリの `type` が Supabase のメール OTP 種別かどうかを判定する
 *
 * @param value クエリから受け取った種別
 * @returns メール OTP 種別なら true
 */
function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value !== null && EMAIL_OTP_TYPES.includes(value as EmailOtpType);
}

/**
 * 確認メールのリンクから戻ってきたリクエストを処理し、セッションを確立する。
 * PKCE の `code` と、メールテンプレートによっては届く `token_hash` の双方に対応する。
 *
 * @param request Supabase からリダイレクトされたリクエスト
 * @returns セッション確立後は `next`、失敗時はログイン画面へのリダイレクト
 */
export async function GET(request: NextRequest) {
  const origin = await getSiteOrigin();
  const { searchParams } = new URL(request.url);

  const errorRedirect = NextResponse.redirect(
    new URL(AUTH_CALLBACK_ERROR_PATH, origin),
  );

  // Supabase 側で検証に失敗した場合はエラーが付いて戻ってくる
  if (searchParams.get("error")) {
    return errorRedirect;
  }

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return errorRedirect;
    }
  } else if (tokenHash && isEmailOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error) {
      return errorRedirect;
    }
  } else {
    return errorRedirect;
  }

  return NextResponse.redirect(
    new URL(toSafeNextPath(searchParams.get("next")), origin),
  );
}
