import { Mail } from 'lucide-react';
import { Suspense } from 'react';

function VerifyEmailContent() {
  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
          <div className="w-full max-w-md space-y-8">
              <div className="bg-white py-8 px-6 shadow rounded-lg">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <h1 className="text-center text-2xl font-bold text-gray-900 mb-2">
                      確認メールを送信しました
                  </h1>
                  <div className="space-y-4 text-sm text-gray-600">
                      <p className="text-center">
                          ご登録いただいたメールアドレスに確認メールを送信しました。
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                          <p className="font-medium text-blue-900 mb-2">📋 次のステップ：</p>
                          <ol className="list-decimal list-inside space-y-1 text-blue-800">
                              <li>メールボックスを確認</li>
                              <li>確認メール内のリンクをクリック</li>
                              <li>ログインしてサービスを開始</li>
                          </ol>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                          <p className="text-xs text-yellow-800">
                              💡 <strong>メールが届かない場合：</strong>
                          </p>
                          <ul className="mt-1 text-xs text-yellow-700 list-disc list-inside">
                              <li>迷惑メールフォルダをご確認ください</li>
                              <li>数分かかる場合があります</li>
                          </ul>
                      </div>
                  </div>
                  <div className="mt-6 space-y-2">
                      <a
                          href="/login"
                          className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                          ログインページへ
                      </a>
                      <a
                          href="/signup"
                          className="block w-full text-center text-sm text-gray-600 hover:text-gray-900 py-2"
                      >
                          別のアドレスで登録する
                      </a>
                  </div>
              </div>
              <p className="text-center text-xs text-gray-500">
                  確認メールは 24時間有効です
              </p>
          </div>
      </div>
    );
}

// Page コンポーネント
export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">読み込み中...</div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}