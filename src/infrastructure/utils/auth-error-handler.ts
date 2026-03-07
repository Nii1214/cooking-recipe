import { AuthError } from '@supabase/supabase-js';

/**
 * エラーコードとメッセージのマッピング
 * 新しいエラーコードを追加する際は、このオブジェクトに追加するだけでOK
 */
const ERROR_CODE_MAP: Record<string, string> = {
    // サインアップ関連
    'email_exists': 'このメールアドレスは既に登録されています',
    'user_already_exists': 'このメールアドレスは既に登録されています',
    'email_address_invalid': 'メールアドレスの形式が正しくありません',
    'weak_password': 'パスワードが弱すぎます。より強力なパスワードを設定してください',
    'signup_disabled': '新規登録は現在受け付けていません',
    
    // ログイン関連
    'invalid_credentials': 'メールアドレスまたはパスワードが正しくありません',
    'email_not_confirmed': 'メールアドレスの確認が完了していません。確認メールをご確認ください',
    
    // セッション関連
    'session_expired': 'セッションの有効期限が切れました。再度ログインしてください',
    'session_not_found': 'セッションが見つかりません。再度ログインしてください',
    
    // レート制限
    'over_email_send_rate_limit': 'メール送信回数の上限に達しました。しばらく時間をおいてから再度お試しください',
    'over_request_rate_limit': 'リクエスト回数の上限に達しました。しばらく時間をおいてから再度お試しください',
} as const;

const DEFAULT_ERROR_MESSAGE = 'エラーが発生しました。もう一度お試しください。';

/**
 * Supabaseの認証エラーを日本語メッセージに変換
 */
export function getAuthErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) {
        return DEFAULT_ERROR_MESSAGE;
    }

    const authError = error as AuthError;
    
    // エラーコードから直接メッセージを取得
    if ('code' in authError && typeof authError.code === 'string') {
        return ERROR_CODE_MAP[authError.code] ?? DEFAULT_ERROR_MESSAGE;
    }

    // フォールバック：メッセージから推測
    return inferErrorMessageFromText(error.message);
}

/**
 * エラーメッセージのテキストから推測する（フォールバック用）
 */
function inferErrorMessageFromText(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('already registered') || lowerMessage.includes('already exists')) {
        return 'このメールアドレスは既に登録されています';
    }
    
    if (lowerMessage.includes('invalid') && (lowerMessage.includes('credentials') || lowerMessage.includes('login'))) {
        return 'メールアドレスまたはパスワードが正しくありません';
    }
    
    return DEFAULT_ERROR_MESSAGE;
}