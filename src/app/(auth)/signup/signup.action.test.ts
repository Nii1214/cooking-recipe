import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signupAction } from './signup.action';
import { AuthRepository } from '@/domain/repositories/auth-repository';
import { DIContainer } from '@/lib/di-container';
import { SignupResult } from '@/types/auth';

vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

/**
 * エラー結果を検証するアサーション関数
 * 関数実行後、resultは { success: false; error: string } 型に絞り込まれる
 * @param result - 検証する結果
 * @param expectedError - 期待するエラーメッセージ
 */
function expectErrorResult(
    result: SignupResult,
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
    result: SignupResult
): asserts result is { success: false; error: string } {
    expect(result.success).toBe(false);
    if (result.success) {
        throw new Error('Expected error result but got success result');
    }
    expect(result.error).toBeTruthy();
    expect(typeof result.error).toBe('string');
}

describe('signupAction(サインアップ処理)', () => {
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

  it('サインアップ成功時に/signup/verify-emailへリダイレクトする', async () => {
    vi.mocked(mockRepository.signup).mockResolvedValue({
      id: 'new-user-id',
      email: 'newuser@example.com',
      createdAt: new Date('2024-01-01'),
    });

    const formData = new FormData();
    formData.append('email', 'newuser@example.com');
    formData.append('password', 'password123');

    await expect(signupAction(null, formData)).rejects.toThrow(
      'REDIRECT:/signup/verify-email'
    );

    expect(mockRepository.signup).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'password123',
    });
  });

  it('メールアドレス形式が不正な場合にバリデーションエラー', async () => {
    const formData = new FormData();
    formData.append('email', 'invalid-email');
    formData.append('password', 'password123');

    const result = await signupAction(null, formData);

    expectErrorResult(result, 'メールアドレスの形式が正しくありません');
    expect(mockRepository.signup).not.toHaveBeenCalled();
  });

  it('パスワードが7文字の場合にバリデーションエラー（境界値）', async () => {
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', '1234567');

    const result = await signupAction(null, formData);

    expectErrorResult(result, 'パスワードは8文字以上で入力してください');
    expect(mockRepository.signup).not.toHaveBeenCalled();
  });

  it('パスワードが8文字の場合に成功する（境界値）', async () => {
    vi.mocked(mockRepository.signup).mockResolvedValue({
      id: 'test-id',
      email: 'test@example.com',
      createdAt: new Date(),
    });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', '12345678');

    await expect(signupAction(null, formData)).rejects.toThrow(
      'REDIRECT:/signup/verify-email'
    );
  });

  it('予期しないエラー時にエラーハンドラーを通してメッセージを返す', async () => {
    vi.mocked(mockRepository.signup).mockRejectedValue(
      new Error('Supabase error')
    );

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    const result = await signupAction(null, formData);

    expectErrorResultExists(result);
  });
});