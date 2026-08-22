'use server';

import { getAuthErrorMessage } from "@/infrastructure/utils/auth-error-handler";
import { signInAnonymously } from "@/infrastructure/repositories/auth/auth-repository-impl";
import { guestLoginUsecase } from "@/usecase/auth/guest-login-usecase";
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
    try {
        const result = await guestLoginUsecase({ signInAnonymously });

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
