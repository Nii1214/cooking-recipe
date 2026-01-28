import { AuthRepository } from "@/domain/repositories/auth-repository";
import { LoginInput, LoginResult } from "@/types/auth";
import { getAuthErrorMessage } from "@/utils/auth-error-handler";

export class LoginUseCase {
    constructor(private authRepository: AuthRepository){}

    async execute(input: LoginInput): Promise<LoginResult> {
        try {
            // メールアドレス形式チェック
            if(!this.isValidEmail(input.email)) {
                return {
                    success:false,
                    error: 'メールアドレスの形式が正しくありません'
                };
            }

            // パスワードが空でないかチェック
            if(input.password.length === 0){
                return {
                    success: false,
                    error: 'パスワードを入力してください'
                }
            }

            const user = await this.authRepository.login(input);
            return { success: true, user};
        }catch (error) {
            const errorMessage = getAuthErrorMessage(error);
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}