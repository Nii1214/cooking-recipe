import { SignupForm } from "@/presentation/components/auth/signup-form";

export default function SignupPage() {
    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h1 className="text-center text-3xl font-bold text-gray-900">アカウント作成</h1>
                    <p className="mt-2 text-center text-sm text-gray-600">料理レシピへようこそ</p>
                </div>
                <div className="bg-white py-8 px-6 shadow rounded-lg">
                    <SignupForm/>   
                </div>
                <p className="text-center text-sm text-gray-600">
                    すでにアカウントをお持ちですか？
                    <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        ログイン
                    </a>
                </p>
            </div>
        </div>
    )
}