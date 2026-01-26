'use client';
import { signupAction } from "@/app/(auth)/signup/actions";
import { SignupResult } from "@/types/auth";
import { useActionState, useState } from "react";

export function SignupForm() {
    const [state, formAction, isPending] = useActionState<SignupResult | null, FormData>(
        signupAction,
        null
    );
    const [showPassword, setShowPassword] = useState(false);
    return (
        <form action={formAction} className="space-y-4 max-w-md mx-auto">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <input
                    id="email"
                    name="email"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="example@example.com" />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">パスワード</label>
                <div className="relative mt-1">
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                        minLength={8}
                        placeholder="8文字以上" />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        )}
                    </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                    8文字以上で入力してください
                </p>
            </div>
            {state && !state.success && (
                <div className="rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-800">{state.error}</p>
                </div>
            )}
            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
            >
                {isPending ? '登録中...' : '新規登録'}
            </button>
        </form>
    );
}