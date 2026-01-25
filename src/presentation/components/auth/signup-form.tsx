'use client';
import { signupAction } from "@/app/(auth)/signup/actions";
import { SignupResult } from "@/types/auth";
import { useActionState } from "react";

export function SignupForm() {
    const [state, formAction, isPending] = useActionState<SignupResult | null, FormData>(
        signupAction,
        null
    );

    return (
        <form action={formAction}>
            <div>
                <label htmlFor="email">メールアドレス</label>
                <input id="email" name="email" required placeholder="example@example.com"/>
            </div>
            <div>
                <label htmlFor="password">パスワード</label>
                <input id="password" name="password" type="password" required minLength={8} placeholder="8文字以上"/>
            </div>
            {state && !state.success && (
                <div className="rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-800">{state.error}</p>
                </div>
            )}
            <button type="submit" disabled={isPending} className="bg-blue-600 text-white hover:bg-blue-700">{isPending ? '登録中...' : '新規登録'}</button>
        </form>
    );
}