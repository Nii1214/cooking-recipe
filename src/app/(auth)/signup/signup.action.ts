'use server';
import { SignupResult } from "@/types/auth";
import { redirect } from "next/navigation";
import { getAuthErrorMessage } from "@/infrastructure/utils/auth-error-handler";
import { DIContainer } from "@/lib/di-container";
import { isRedirectError } from "@/utils/redirect";

export async function signupAction(
    _prevState: SignupResult | null,
    formData: FormData
):Promise<SignupResult> {

    const email = formData.get('email') as string | null;
    const password = formData.get('password') as string | null;

    // 依存性注入
    const useCase = DIContainer.getSignupUseCase();

    try{
        const result = await useCase.execute({ 
            email: email ?? '', 
            password: password ?? '' 
        });
        
        if(result.success) {
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