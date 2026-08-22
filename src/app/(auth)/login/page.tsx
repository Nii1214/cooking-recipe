import { LoginForm } from "@/presentation/components/auth/login-form";
import { GuestLoginForm } from "@/presentation/components/auth/guest-login-form";
import { ERROR_MESSAGES } from "@/constants/error-messages";

type Props = {
    searchParams: Promise<{ authError?: string }>;
};

/**
 * ログイン画面
 *
 * @param searchParams `authError` が付いている場合は確認リンク失敗の案内を表示する
 * @returns ログイン画面
 */
export default async function LoginPage({ searchParams }: Props) {
    const { authError } = await searchParams;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h1 className="text-center text-3xl font-bold text-gray-900">ログイン</h1>
                    <p className="mt-2 text-center text-sm text-gray-600">アカウントにログイン</p>
                </div>
                {authError && (
                    <div className="rounded-md border border-rose-200 bg-rose-50 p-4">
                        <p className="text-sm text-rose-800">
                            {ERROR_MESSAGES.EMAIL_CONFIRM_LINK_INVALID}
                        </p>
                    </div>
                )}
                <div className="bg-white py-8 px-6 shadow rounded-lg">
                    <LoginForm />
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">または</span>
                        </div>
                    </div>
                    <GuestLoginForm />
                </div>
                <p className="text-center text-sm text-gray-600">
                    アカウントをお持ちでないですか？
                    <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                        新規登録
                    </a>
                </p>
            </div>
        </div>
    );
}