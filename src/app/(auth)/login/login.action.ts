'use server';
import { getAuthErrorMessage } from "@/infrastructure/utils/auth-error-handler";
import { login } from "@/infrastructure/repositories/auth/auth-repository-impl";
import { loginUsecase } from "@/usecase/auth/login-usecase";
import { LoginResult } from "@/types/auth";
import { redirect } from "next/navigation";
import { isRedirectError } from "@/utils/redirect";

/**
 * ログイン Server Action
 * @param _prevState useActionState 用（未使用）
 * @param formData email / password を含むフォーム入力
 * @returns 失敗時のみ結果を返す（成功時は /top へリダイレクト）
 */
export async function loginAction(
    _prevState: LoginResult | null,
    formData: FormData
): Promise<LoginResult> {

    const email = formData.get('email') as string | null;
    const password = formData.get('password') as string | null;

    try {
        const result = await loginUsecase(
            {
                email: email ?? '',
                password: password ?? ''
            },
            { login },
        );

        if (result.success) {
            redirect('/top');
        }

        return result;
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        return {
            success: false,
            error: getAuthErrorMessage(error),
        };
    }
}
