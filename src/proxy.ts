import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** 認証なしでアクセスできるパス */
const PUBLIC_PATHS = ["/", "/login", "/signup", "/signup/verify-email"];

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    // NOTE: createServerClient と supabase.auth.getUser() の間にコードを挟まないこと。
    // セッションが壊れてランダムにログアウトする問題の原因になる。
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;
    const isPublic = PUBLIC_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
    );

    if (!user && !isPublic) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // NOTE: supabaseResponse をそのまま返すこと。
    // 新しい NextResponse を返す場合は cookies をコピーすること（セッション維持に必要）。
    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * 以下を除く全パスにマッチ:
         * - _next/static  (静的ファイル)
         * - _next/image   (画像最適化)
         * - favicon.ico
         * - 画像拡張子
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
