export const ERROR_MESSAGES = {
    // 入力値エラー
    INVALID_INPUT: '入力値が不正です',
    
    // メールアドレスエラー
    EMAIL_REQUIRED: 'メールアドレスは必須です',
    EMAIL_INVALID_FORMAT: 'メールアドレスの形式が正しくありません',
    EMAIL_ALREADY_EXISTS: 'このメールアドレスは既に登録されています',
    EMAIL_NOT_CONFIRMED: 'メールアドレスの確認が完了していません。確認メールをご確認ください',
    
    // パスワードエラー
    PASSWORD_REQUIRED: 'パスワードを入力してください',
    PASSWORD_MIN_LENGTH: (min: number) => `パスワードは${min}文字以上で入力してください`,
    PASSWORD_WEAK: 'パスワードが弱すぎます。より強力なパスワードを設定してください',
    
    // 認証エラー
    INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません',
    LOGIN_FAILED: 'ログインに失敗しました',
    SIGNUP_FAILED: 'ユーザー作成に失敗しました',
    
    // セッションエラー
    SESSION_EXPIRED: 'セッションの有効期限が切れました。再度ログインしてください',
    SESSION_NOT_FOUND: 'セッションが見つかりません。再度ログインしてください',
    
    // レート制限
    RATE_LIMIT_EMAIL: 'メール送信回数の上限に達しました。しばらく時間をおいてから再度お試しください',
    RATE_LIMIT_REQUEST: 'リクエスト回数の上限に達しました。しばらく時間をおいてから再度お試しください',
    
    // 汎用エラー
    UNKNOWN_ERROR: 'エラーが発生しました。もう一度お試しください。',
    UNEXPECTED_ERROR: '予期しないエラーが発生しました。しばらく時間をおいてから再度お試しください',
} as const;