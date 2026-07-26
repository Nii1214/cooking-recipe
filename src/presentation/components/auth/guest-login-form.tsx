'use client';

import { GuestLoginButton } from "@/presentation/components/auth/guest-login-button";

/**
 * ログイン画面向けのゲスト（匿名）ログインフォーム
 */
export function GuestLoginForm() {
    return (
        <GuestLoginButton
            formClassName="mt-4"
            showHelperText
        />
    );
}
