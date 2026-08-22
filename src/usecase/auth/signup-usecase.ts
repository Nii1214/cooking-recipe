import type { SignupInput, User } from "@/domain/repositories/auth-repository";
import type { SignupResult } from "@/types/auth";
import { isValidEmail, isValidPasswordLength } from "@/utils/validation";
import { ERROR_MESSAGES } from "@/constants/error-messages";

/** パスワードの最小文字数 */
const PASSWORD_MIN_LENGTH = 8;

/**
 * ユーザー登録ユースケースが依存する処理。
 * action 層で infrastructure の実装を渡す。
 */
export type SignupDeps = {
    signup: (input: SignupInput) => Promise<User>;
};

/**
 * 入力を検証したうえでユーザーを登録する
 * @param input メールアドレスとパスワード
 * @param deps 依存するリポジトリ操作
 * @returns 成功時はユーザー情報、失敗時はエラーメッセージ
 */
export const signupUsecase = async (
    input: SignupInput,
    deps: SignupDeps,
): Promise<SignupResult> => {
    if (!isValidEmail(input.email)) {
        return {
            success: false,
            error: ERROR_MESSAGES.EMAIL_INVALID_FORMAT,
        };
    }

    if (!isValidPasswordLength(input.password, PASSWORD_MIN_LENGTH)) {
        return {
            success: false,
            error: ERROR_MESSAGES.PASSWORD_MIN_LENGTH(PASSWORD_MIN_LENGTH),
        };
    }

    const user = await deps.signup(input);
    return { success: true, user };
};
