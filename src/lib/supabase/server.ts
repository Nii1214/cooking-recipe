import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// cookies()が終わるまで一旦止まって、結果が帰ってきてから次の処理に進む
export async function createClient(){
    // ブラウザから送られたクッキー一式を取得
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies:{
                get(name:string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: Record<string, unknown>) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch {
                        // Server Component では cookie を set できない場合がある
                    }
                },
                remove(name: string, options: Record<string, unknown>) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch {
                        // Server Component では cookie を remove できない場合がある
                    }
                },
            },
        },
    );
}

/**
 * 認証済みであることを保証するクライアント生成関数
 * セッションがない場合は一律で UNAUTHORIZED エラーを投げる
 */
export async function createAuthedClient() {
    const supabase = await createClient();
    
    // getUser() はセッションの妥当性をサーバー側で再確認するため、getSession() より安全です
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("UNAUTHORIZED");
    }

    // クライアントと、すでに取得済みのユーザー情報をセットで返却
    return { supabase, user };
}