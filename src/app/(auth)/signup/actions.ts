import { SignupUseCase } from "@/src/infrastructure/auth/signup.usecase";
import { AuthRepositoryImpl } from "@/src/infrastructure/repositories/auth-repository-impl";
import { SignupResult } from "@/src/types/auth";
import { redirect } from "next/navigation";

`use server`;

export async function signupAction(
    _prevState: SignupResult | null,
    formData: FormData
):Promise<SignupResult> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // 依存性注入
    const repository = new AuthRepositoryImpl();
    const useCase = new SignupUseCase(repository);

    const result = await useCase.execute({ email , password});
    if(result.success) {
        redirect('/top');
    }
    return result;
}