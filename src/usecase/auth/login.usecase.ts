import { AuthRepository, LoginInput } from "@/domain/repositories/auth-repository";
import { LoginResult } from "@/types/auth";
import { isPasswordNotEmpty, isValidEmail } from "@/utils/validation";
import { ERROR_MESSAGES } from "@/constants/error-messages";

/**
 * ログインのビジネスロジックを実行するUseCase
 * 
 * @remarks
 * - メールアドレスとパスワードのバリデーション
 * - AuthRepositoryを通じてログイン処理
 * - Resultパターンで成功/失敗を返却
 */
export class LoginUseCase {
    /**
     * @param authRepository - 認証リポジトリのインターフェース
     */
    constructor(private authRepository: AuthRepository){}

    /**
     * ログイン処理を実行
     * 
     * @param input - メールアドレスとパスワード
     * @returns 成功時はユーザー情報、失敗時はエラーメッセージ
     */
    async execute(input: LoginInput): Promise<LoginResult> {        
        if(!isValidEmail(input.email)) {
            return {
                success: false,
                error: ERROR_MESSAGES.EMAIL_INVALID_FORMAT
            };
        }

        if(!isPasswordNotEmpty(input.password)){
            return {
                success: false,
                error: ERROR_MESSAGES.PASSWORD_REQUIRED
            }
        }

        const user = await this.authRepository.login(input);
        return { success: true, user};
    }
}