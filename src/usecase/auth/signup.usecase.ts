import { AuthRepository, SignupInput } from "@/domain/repositories/auth-repository";
import { SignupResult } from "@/types/auth";
import { isValidEmail, isValidPasswordLength } from "@/utils/validation";

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
        // メールアドレス形式チェック
        if(!isValidEmail(input.email)) {
            return {
                success: false,
                error: 'メールアドレスの形式が正しくありません'
            };
        }
        // パスワード文字数チェック
        if(!isValidPasswordLength(input.password,8)) {
            return {
                success: false,
                error: 'パスワードは8文字以上で入力してください'
            };
        }

        // 登録処理
        const user = await this.authRepository.signup(input);
        return { success: true, user};
    }
}