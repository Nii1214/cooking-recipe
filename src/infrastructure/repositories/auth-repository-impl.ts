import { AuthRepository, LoginInput, SignupInput, User } from "@/domain/repositories/auth-repository";
import { AUTH_CALLBACK_PATH } from "@/constants/auth";
import { getSiteOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export class AuthRepositoryImpl implements AuthRepository {
    async signup(input: SignupInput): Promise<User> {
        const supabase = await createClient();
        const origin = await getSiteOrigin();

        const  {data, error} = await supabase.auth.signUp({
            email: input.email,
            password: input.password,
            options: {
                // 確認メールのリンク先。Supabase の Redirect URLs に登録した URL と一致させること
                emailRedirectTo: `${origin}${AUTH_CALLBACK_PATH}`,
            },
        });

        // エラーチェック
        if(error) {
            throw error;
        }
        // nullチェック
        if(!data.user) {
            throw new Error('SIGNUP_FAILED');
        }

        return {
            id: data.user.id,
            email: data.user.email!,
            createdAt: new Date(data.user.created_at),
        };
    }

    async login(input: LoginInput): Promise<User> {
        const supabase = await createClient();

        const {data, error} = await supabase.auth.signInWithPassword({
            email: input.email,
            password: input.password,
        });

        // エラーチェック
        if(error) {
            throw error;
        }

        // nullチェック
        if(!data.user) {
            throw new Error('LOGIN_FAILED');
        }

        return {
            id: data.user.id,
            email: data.user.email!,
            createdAt: new Date(data.user.created_at),
        };
    }

    /**
     * 匿名（ゲスト）サインインを実行する
     * @returns 作成または再利用された匿名ユーザー
     */
    async signInAnonymously(): Promise<User> {
        const supabase = await createClient();

        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
            throw error;
        }

        if (!data.user) {
            throw new Error('GUEST_LOGIN_FAILED');
        }

        return {
            id: data.user.id,
            email: data.user.email ?? '',
            createdAt: new Date(data.user.created_at),
        };
    }
}