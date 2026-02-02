/**
 * 認証関連のバリデーション関数
 * 
 * @remarks
 * - 純粋関数として実装（副作用なし）
 * - 真偽値のみを返す（エラーメッセージは返さない）
 */

/**
 * メールアドレスの形式を検証
 * 
 * @param email - 検証するメールアドレス
 * @returns 有効なメールアドレス形式の場合 true
 * 
 * @example
 * ```typescript
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email')     // false
 * ```
 */
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * パスワードの最小文字数を検証
 * 
 * @param password - 検証するパスワード
 * @param minLength - 最小文字数（デフォルト: 8）
 * @returns 最小文字数を満たしている場合 true
 * 
 * @example
 * ```typescript
 * isValidPasswordLength('password123', 8) // true
 * isValidPasswordLength('pass', 8)        // false
 * ```
 */
export function isValidPasswordLength(
    password: string, 
    minLength: number = 8
): boolean {
    return password.length >= minLength;
}

/**
 * パスワードが空でないかを検証
 * 
 * @param password - 検証するパスワード
 * @returns パスワードが空でない場合 true
 * 
 * @example
 * ```typescript
 * isPasswordNotEmpty('password') // true
 * isPasswordNotEmpty('')         // false
 * ```
 */
export function isPasswordNotEmpty(password: string): boolean {
    return password.length > 0;
}