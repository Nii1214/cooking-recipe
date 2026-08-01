import { AuthRepository, LoginInput, SignupInput, User } from "@/domain/repositories/auth-repository";
import { createClient } from "@/lib/supabase/server";

export class AuthRepositoryImpl implements AuthRepository {
    async signup(input: SignupInput): Promise<User> {
        const supabase = await createClient();

        const  {data, error} = await supabase.auth.signUp({
            email: input.email,
            password: input.password,
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