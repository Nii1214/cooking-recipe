'use server';
import { SignupResult } from "@/types/auth";
import { redirect } from "next/navigation";
import { getAuthErrorMessage } from "@/infrastructure/utils/auth-error-handler";
import { signup } from "@/infrastructure/repositories/auth/auth-repository-impl";
import { signupUsecase } from "@/usecase/auth/signup-usecase";
import { isRedirectError } from "@/utils/redirect";

/**
 * サインアップ Server Action
 * @param _prevState useActionState 用（未使用）
 * @param formData email / password を含むフォーム入力
 * @returns 失敗時のみ結果を返す（成功時は確認メール案内へリダイレクト）
 */
export async function signupAction(
    _prevState: SignupResult | null,
    formData: FormData
): Promise<SignupResult> {

    const email = formData.get('email') as string | null;
    const password = formData.get('password') as string | null;

    try {
        const result = await signupUsecase(
            {
                email: email ?? '',
                password: password ?? ''
            },
            { signup },
        );

        if (result.success) {
            redirect('/signup/verify-email');
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
