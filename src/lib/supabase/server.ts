import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// cookies()が終わるまで一旦止まって、結果が帰ってきてから次の処理に進む
export async function createClient(){
    // ブラウザから送られたクッキー一式を取得
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies:{
                get(name:string) {
                    // Cookieがあればvalueを返す(なければundefined)
                    return cookieStore.get(name)?.value;
                },
            },
        },
    );
}