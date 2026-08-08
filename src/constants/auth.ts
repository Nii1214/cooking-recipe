/** メール確認リンクの戻り先となる Route Handler のパス */
export const AUTH_CALLBACK_PATH = "/auth/callback";

/** メール確認が完了したあとの遷移先 */
export const AUTH_CALLBACK_SUCCESS_PATH = "/top";

/** 確認リンクが無効だったときの遷移先 */
export const AUTH_CALLBACK_ERROR_PATH = "/login?authError=1";
