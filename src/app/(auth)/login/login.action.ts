'use server';
import { getAuthErrorMessage } from "@/infrastructure/utils/auth-error-handler";
import { DIContainer } from "@/lib/di-container";
import { LoginResult } from "@/types/auth";
import { redirect } from "next/navigation";
import { isRedirectError } from "@/utils/redirect";

export async function loginAction(
    _prevState: LoginResult | null,
    formData: FormData
): Promise<LoginResult> {

    const email = formData.get('email') as string | null;
    const password = formData.get('password') as string | null;

    const useCase = DIContainer.getLoginUseCase();

    try {
        const result = await useCase.execute({
            email: email ?? '',
            password: password ?? ''
        });

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