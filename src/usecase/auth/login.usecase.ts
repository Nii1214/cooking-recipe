import { AuthRepository, LoginInput } from "@/domain/repositories/auth-repository";
import { LoginResult } from "@/types/auth";
import { isPasswordNotEmpty, isValidEmail } from "@/utils/validation";


export class LoginUseCase {
    constructor(private authRepository: AuthRepository){}

    async execute(input: LoginInput): Promise<LoginResult> {
        // メールアドレス形式チェック
        if(!isValidEmail(input.email)) {
            return {
                success:false,
                error: 'メールアドレスの形式が正しくありません'
            };
        }

        // パスワードが空でないかチェック
        if(!isPasswordNotEmpty(input.password)){
            return {
                success: false,
                error: 'パスワードを入力してください'
            }
        }

        const user = await this.authRepository.login(input);
        return { success: true, user};
    }
}