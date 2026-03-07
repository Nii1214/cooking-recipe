import { AuthRepository, SignupInput } from "@/domain/repositories/auth-repository";
import { SignupResult } from "@/types/auth";
import { isValidEmail, isValidPasswordLength } from "@/utils/validation";
import { ERROR_MESSAGES } from "@/constants/error-messages";

/**
 * ユーザー登録のビジネスロジックを実行するUseCase
 * 
 * @remarks
 * - メールアドレスとパスワードのバリデーション
 * - AuthRepositoryを通じてユーザー登録
 * - Resultパターンで成功/失敗を返却
 */
export class SignupUseCase {
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
                error: ERROR_MESSAGES.EMAIL_INVALID_FORMAT
            };
        }
        
        // パスワード文字数チェック
        if(!isValidPasswordLength(input.password,8)) {
            return {
                success: false,
                error: ERROR_MESSAGES.PASSWORD_MIN_LENGTH(8)
            };
        }

        // 登録処理
        const user = await this.authRepository.signup(input);
        return { success: true, user};
    }
}