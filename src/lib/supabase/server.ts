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
                set(name: string, value: string, options: any) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch {
                        // Server Component では cookie を set できない場合がある
                    }
                },
                remove(name: string, options: any) {
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