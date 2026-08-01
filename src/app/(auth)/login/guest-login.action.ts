'use server';

import { getAuthErrorMessage } from "@/infrastructure/utils/auth-error-handler";
import { DIContainer } from "@/lib/di-container";
import { GuestLoginResult } from "@/types/auth";
import { redirect } from "next/navigation";
import { isRedirectError } from "@/utils/redirect";

/**
 * ゲスト（匿名）ログイン Server Action
 * @param _prevState - useActionState 用（未使用）
 * @returns 失敗時のみ結果を返す（成功時は /top へリダイレクト）
 */
export async function guestLoginAction(
    _prevState: GuestLoginResult | null,
): Promise<GuestLoginResult> {
    const useCase = DIContainer.getGuestLoginUseCase();

    try {
        const result = await useCase.execute();

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
