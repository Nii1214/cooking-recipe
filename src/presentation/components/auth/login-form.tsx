'use client';
import { loginAction } from "@/app/(auth)/login/actions";
import { LoginResult } from "@/types/auth";
import { useActionState, useState } from "react";
import { Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
    const [state, formAction, isPending] = useActionState<LoginResult | null, FormData>(
        loginAction,
        null
    );
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form action={formAction} className="space-y-4 max-w-md mx-auto">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    メールアドレス
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="example@example.com"
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    パスワード
                </label>
                <div className="relative mt-1">
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                        placeholder="パスワードを入力"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                </div>
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
                {isPending ? 'ログイン中...' : 'ログイン'}
            </button>
        </form>
    );
}