import { AuthRepository } from "@/domain/repositories/auth-repository";
import { GuestLoginResult } from "@/types/auth";

/**
 * ゲスト（匿名）ログインのビジネスロジックを実行する UseCase
 */
export class GuestLoginUseCase {
    /**
     * @param authRepository - 認証リポジトリのインターフェース
     */
    constructor(private authRepository: AuthRepository) {}

    /**
     * 匿名サインインを実行する
     * @returns 成功時はユーザー情報、失敗時はエラーメッセージ
     */
    async execute(): Promise<GuestLoginResult> {
        const user = await this.authRepository.signInAnonymously();
        return { success: true, user };
    }
}
