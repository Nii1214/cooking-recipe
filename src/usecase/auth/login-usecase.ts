import type { LoginInput, User } from "@/domain/repositories/auth-repository";
import type { LoginResult } from "@/types/auth";
import { isPasswordNotEmpty, isValidEmail } from "@/utils/validation";
import { ERROR_MESSAGES } from "@/constants/error-messages";

/**
 * ログインユースケースが依存する処理。
 * action 層で infrastructure の実装を渡す。
 */
export type LoginDeps = {
    login: (input: LoginInput) => Promise<User>;
};

/**
 * 入力を検証したうえでログインする
 * @param input メールアドレスとパスワード
 * @param deps 依存するリポジトリ操作
 * @returns 成功時はユーザー情報、失敗時はエラーメッセージ
 */
export const loginUsecase = async (
    input: LoginInput,
    deps: LoginDeps,
): Promise<LoginResult> => {
    if (!isValidEmail(input.email)) {
        return {
            success: false,
            error: ERROR_MESSAGES.EMAIL_INVALID_FORMAT,
        };
    }

    if (!isPasswordNotEmpty(input.password)) {
        return {
            success: false,
            error: ERROR_MESSAGES.PASSWORD_REQUIRED,
        };
    }

    const user = await deps.login(input);
    return { success: true, user };
};
