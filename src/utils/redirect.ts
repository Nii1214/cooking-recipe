/**
 * Next.js の redirect() が投げた例外かどうかを判定する。
 * redirect() は例外でリダイレクトを行うため、try/catch で catch したら再スローする必要がある。
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/redirect - "redirect throws an error so it should be called outside the try block"
 * @see https://nextjs.org/docs/app/api-reference/functions/unstable_rethrow - redirect() は Next.js が処理すべき例外として再スローする
 */
export function isRedirectError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null || !('digest' in error)) {
        return false;
    }
    const digest = (error as { digest?: string }).digest;
    return typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT');
}
