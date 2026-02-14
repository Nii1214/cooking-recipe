import { AuthError } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "./auth-error-handler";

describe('getAuthMessage(認証エラーメッセージ変換',() => {
    describe('エラーコードから直接変換',() => {
        it('エラーコードから直接変換',() => {
            const error = new AuthError('Email exits',400,'email_exits');
            expect(getAuthErrorMessage(error)).toBe('このメールアドレスは既に登録されています');
        });

        it('user_already_exists: ユーザーが既に存在するエラー', () => {
            const error = new AuthError('User already exists', 400, 'user_already_exists');
            expect(getAuthErrorMessage(error)).toBe('このメールアドレスは既に登録されています');
        });
    
        it('invalid_credentials: ログイン認証情報が不正', () => {
            const error = new AuthError('Invalid credentials', 400, 'invalid_credentials');
            expect(getAuthErrorMessage(error)).toBe('メールアドレスまたはパスワードが正しくありません');
        });
    
        it('email_not_confirmed: メール未確認', () => {
            const error = new AuthError('Email not confirmed', 400, 'email_not_confirmed');
            expect(getAuthErrorMessage(error)).toBe('メールアドレスの確認が完了していません。確認メールをご確認ください');
        });
    
        it('weak_password: 弱いパスワード', () => {
            const error = new AuthError('Weak password', 400, 'weak_password');
            expect(getAuthErrorMessage(error)).toBe('パスワードが弱すぎます。より強力なパスワードを設定してください');
        });
    
        it('over_email_send_rate_limit: メール送信レート制限', () => {
            const error = new AuthError('Rate limit', 429, 'over_email_send_rate_limit');
            expect(getAuthErrorMessage(error)).toBe('メール送信回数の上限に達しました。しばらく時間をおいてから再度お試しください');
        });
    })

    describe('異常系・境界値', () => {
        it('Errorオブジェクトでない場合はデフォルトメッセージ', () => {
          expect(getAuthErrorMessage('string error')).toBe('エラーが発生しました。もう一度お試しください。');
          expect(getAuthErrorMessage(null)).toBe('エラーが発生しました。もう一度お試しください。');
          expect(getAuthErrorMessage(undefined)).toBe('エラーが発生しました。もう一度お試しください。');
          expect(getAuthErrorMessage(123)).toBe('エラーが発生しました。もう一度お試しください。');
        });
    
        it('codeプロパティが存在するが文字列でない場合', () => {
          const error = { code: 123, message: 'error' } as unknown as Error;
          expect(getAuthErrorMessage(error)).toBe('エラーが発生しました。もう一度お試しください。');
        });
    
        it('メッセージが空文字列の場合', () => {
          const error = new Error('');
          expect(getAuthErrorMessage(error)).toBe('エラーが発生しました。もう一度お試しください。');
        });
    });
})