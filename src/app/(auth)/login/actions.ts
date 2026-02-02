'use server';
import { AuthRepositoryImpl } from "@/infrastructure/repositories/auth-repository-impl";
import { getAuthErrorMessage } from "@/infrastructure/utils/auth-error-handler";
import { LoginResult } from "@/types/auth";
import { LoginUseCase } from "@/usecase/auth/login.usecase";
import { redirect } from "next/navigation";

export async function loginAction (
    _prevState: LoginResult | null,
    formData: FormData
):Promise<LoginResult> {

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // 依存性注入
    const repository = new AuthRepositoryImpl();
    const useCase = new LoginUseCase(repository);

    try {
        const result = await useCase.execute({ email, password });

        if(result.success){
            //ログイン成功時にトップページへリダイレクト
            redirect('/top');
        }

        return result;
    } catch(error) {
        return {
            success: false,
            error: getAuthErrorMessage(error),
        }
    }
    
}