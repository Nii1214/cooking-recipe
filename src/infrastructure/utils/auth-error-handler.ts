import { AuthError } from '@supabase/supabase-js';

/**
 * Supabaseの認証エラーを日本語メッセージに変換
 * 
 * @param error - Supabaseのエラーオブジェクト
 * @returns 日本語のエラーメッセージ
 */
export function getAuthErrorMessage(error: unknown): string {
    // Error型でない場合は、汎用エラーメッセージを返す
    if (!(error instanceof Error)) {
        return 'エラーが発生しました。もう一度お試しください。';
    }

    // SupabaseのAuthErrorかどうかを判定
    const authError = error as AuthError;
    
    // エラーコードで判定（最も信頼性が高い）
    if ('code' in authError && typeof authError.code === 'string') {
        switch (authError.code) {
            // サインアップ関連
            case 'email_exists':
            case 'user_already_exists':
                return 'このメールアドレスは既に登録されています';
            
            case 'email_address_invalid':
                return 'メールアドレスの形式が正しくありません';
            
            case 'weak_password':
                return 'パスワードが弱すぎます。より強力なパスワードを設定してください';
            
            case 'signup_disabled':
                return '新規登録は現在受け付けていません';
            
            // ログイン関連
            case 'invalid_credentials':
                return 'メールアドレスまたはパスワードが正しくありません';
            
            case 'email_not_confirmed':
                return 'メールアドレスの確認が完了していません。確認メールをご確認ください';
            
            case 'phone_not_confirmed':
                return '電話番号の確認が完了していません';
            
            // セッション関連
            case 'session_expired':
                return 'セッションの有効期限が切れました。再度ログインしてください';
            
            case 'session_not_found':
                return 'セッションが見つかりません。再度ログインしてください';
            
            // レート制限
            case 'over_email_send_rate_limit':
                return 'メール送信回数の上限に達しました。しばらく時間をおいてから再度お試しください';
            
            case 'over_request_rate_limit':
                return 'リクエスト回数の上限に達しました。しばらく時間をおいてから再度お試しください';
            
            // その他
            case 'validation_failed':
                return '入力内容に誤りがあります。もう一度ご確認ください';
            
            case 'unexpected_failure':
                return '予期しないエラーが発生しました。しばらく時間をおいてから再度お試しください';
            
            default:
                // 未知のエラーコードの場合は、汎用メッセージを返す
                return 'エラーが発生しました。もう一度お試しください。';
        }
    }

    // エラーコードがない場合は、メッセージから推測（フォールバック）
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('already registered') || 
        errorMessage.includes('already exists')) {
        return 'このメールアドレスは既に登録されています';
    }
    
    if (errorMessage.includes('invalid') && 
        (errorMessage.includes('credentials') || errorMessage.includes('login'))) {
        return 'メールアドレスまたはパスワードが正しくありません';
    }
    
    if (errorMessage.includes('email') && errorMessage.includes('not confirmed')) {
        return 'メールアドレスの確認が完了していません。確認メールをご確認ください';
    }

    // それでも判定できない場合は、汎用メッセージ
    return 'エラーが発生しました。もう一度お試しください。';
}