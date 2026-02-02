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
            throw new Error(`Signup failed:${error.message}`);
        }
        // nullチェック
        if(!data.user) {
            throw new Error('ユーザー作成に失敗しました');
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
            throw new Error(`Login failed: ${error.message}`);
        }

        // nullチェック
        if(!data.user) {
            throw new Error('ログインに失敗しました');
        }

        return {
            id: data.user.id,
            email: data.user.email!,
            createdAt: new Date(data.user.created_at),
        };
    }

    async findByEmail(email: string) : Promise<User | null> {
        // カスタムロジックが必要な場合のみ追加
        return null;
    }
}