'use client';

import { guestLoginAction } from "@/app/(auth)/login/guest-login.action";
import { GuestLoginResult } from "@/types/auth";
import { useActionState } from "react";
import { UserRound } from "lucide-react";

type GuestLoginButtonProps = {
    /** ボタンに適用する Tailwind クラス */
    buttonClassName?: string;
    /** 補助テキストを表示するか */
    showHelperText?: boolean;
    /** 補助テキストに適用する Tailwind クラス */
    helperClassName?: string;
    /** form 要素に適用する Tailwind クラス */
    formClassName?: string;
};

const defaultButtonClassName =
    "flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50";

/**
 * ゲスト（匿名）ログイン用ボタン
 * @param props 表示スタイルのカスタマイズ
 */
export function GuestLoginButton({
    buttonClassName = defaultButtonClassName,
    showHelperText = false,
    helperClassName = "mt-2 text-center text-xs text-gray-500",
    formClassName,
}: GuestLoginButtonProps) {
    const [state, formAction, isPending] = useActionState<GuestLoginResult | null, FormData>(
        guestLoginAction,
        null
    );

    return (
        <form action={formAction} className={formClassName}>
            {state && !state.success && (
                <div className="mb-3 rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-800">{state.error}</p>
                </div>
            )}
            <button
                type="submit"
                disabled={isPending}
                className={buttonClassName}
            >
                <UserRound className="h-4 w-4" />
                {isPending ? 'ゲストログイン中...' : 'ゲストで試す'}
            </button>
            {showHelperText && (
                <p className={helperClassName}>
                    アカウント不要で体験できます（データは一定期間後に削除されます）
                </p>
            )}
        </form>
    );
}
