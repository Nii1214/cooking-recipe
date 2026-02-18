import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginAction } from "./login.action";
import { AuthRepository } from "@/domain/repositories/auth-repository";
import { DIContainer } from "@/lib/di-container";
import { LoginResult } from "@/types/auth";
import { redirect } from "next/navigation";

/** Next.js の redirect() と同じ形の例外を投げる（action の isRedirectError で判定される） */
vi.mock('next/navigation', () => ({
    redirect: vi.fn((path: string) => {
        const err = new Error('NEXT_REDIRECT') as Error & { digest: string };
        err.digest = `NEXT_REDIRECT;replace;${path};307;`;
        throw err;
    }),
}));

/**
 * エラー結果を検証するアサーション関数
 * 関数実行後、resultは { success: false; error: string } 型に絞り込まれる
 * @param result - 検証する結果
 * @param expectedError - 期待するエラーメッセージ
 */
function expectErrorResult(
    result: LoginResult,
    expectedError: string
): asserts result is { success: false; error: string } {
    expect(result.success).toBe(false);
    if (result.success) {
        throw new Error('Expected error result but got success result');
    }
    expect(result.error).toBe(expectedError);
}

/**
 * エラー結果が存在することを検証するアサーション関数
 * 関数実行後、resultは { success: false; error: string } 型に絞り込まれる
 * @param result - 検証する結果
 */
function expectErrorResultExists(
    result: LoginResult
): asserts result is { success: false; error: string } {
    expect(result.success).toBe(false);
    if (result.success) {
        throw new Error('Expected error result but got success result');
    }
    expect(result.error).toBeTruthy();
    expect(typeof result.error).toBe('string');
}

describe('loginAction(ログイン処理)', () => {
    let mockRepository: AuthRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        DIContainer.resetForTesting();

        mockRepository = {
            login: vi.fn(),
            signup: vi.fn(),
            findByEmail: vi.fn(),
        } as AuthRepository;

        DIContainer.setAuthRepositoryForTesting(mockRepository);
    });

    it('ログイン成功時に/topへリダイレクトする', async () => {
        // Repositoryのモックを設定
        vi.mocked(mockRepository.login).mockResolvedValue({
            id: 'test-id',
            email: 'test@example.com',
            createdAt: new Date('2024-01-01')
        });

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');

        await expect(loginAction(null, formData)).rejects.toThrow('NEXT_REDIRECT');
        expect(vi.mocked(redirect)).toHaveBeenCalledWith('/top');

        expect(mockRepository.login).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });
    });

    it('ログイン失敗時にエラーメッセージを返す', async () => {
        // Repositoryレベルでエラーをスロー
        vi.mocked(mockRepository.login).mockRejectedValue(
            new Error('invalid_credentials')
        );

        const formData = new FormData();
        formData.append('email', 'wrong@example.com');
        formData.append('password', 'wrongpassword');

        const result = await loginAction(null, formData);

        expectErrorResultExists(result);
    });

    it('メールアドレス形式が不正な場合にバリデーションエラー', async () => {
        // UseCaseでバリデーションされるため、Repositoryは呼ばれない
        const formData = new FormData();
        formData.append('email', 'invalid-email');
        formData.append('password', 'password123');

        const result = await loginAction(null, formData);

        expectErrorResult(result, 'メールアドレスの形式が正しくありません');

        // Repositoryが呼ばれていないことを検証
        expect(mockRepository.login).not.toHaveBeenCalled();
    });

    it('パスワードが空の場合にバリデーションエラー', async () => {
        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', '');

        const result = await loginAction(null, formData);

        expectErrorResult(result, 'パスワードを入力してください');
        expect(mockRepository.login).not.toHaveBeenCalled();
    });

    it('FormDataが空の場合にバリデーションエラー', async () => {
        const formData = new FormData();

        const result = await loginAction(null, formData);

        expect(result.success).toBe(false);
        expect(mockRepository.login).not.toHaveBeenCalled();
    });
});