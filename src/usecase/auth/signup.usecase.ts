import { AuthRepository } from "@/domain/repositories/auth-repository";
import { SignupInput, SignupResult } from "@/types/auth";

/**
 * ユーザー登録のビジネスロジックを実行するUseCase
 * 
 * @remarks
 * - メールアドレスとパスワードのバリデーション
 * - AuthRepositoryを通じてユーザー登録
 * - Resultパターンで成功/失敗を返却
 */
export class SignupUseCase {
    /**
     * @param authRepository 
     */
    constructor(private authRepository: AuthRepository){}

    /**
     * サインアップ処理を実行
     * 
     * @param input - メールアドレスとパスワード
     * @returns 成功時はユーザー情報、失敗時はエラーメッセージ
     */
    async execute(input: SignupInput): Promise<SignupResult>{
        try{
            // メールアドレス形式チェック
            if(!this.isValidEmail(input.email)) {
                return {
                    success: false,
                    error: 'メールアドレスの形式が正しくありません'
                };
            }
            // パスワード文字数チェック
            if(input.password.length < 8) {
                return {
                    success: false,
                    error: 'パスワードは8文字以上で入力してください'
                };
            }

            // 登録処理
            const user = await this.authRepository.signup(input);
            return { success: true, user};

        } catch(error) {
            //supabase固有のエラーメッセージを日本語に変換
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if(errorMessage.includes('already registered')) {
                return {
                    success: false,
                    error: 'このメールアドレスは既に登録されています'
                };
            }

            return {
                success: false,
                error: '登録に失敗しました。もう一度お試しください。'
            };
        }
    }

    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}