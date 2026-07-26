// npm run test:run -- src/app/(auth)/login/guest-login.action.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { guestLoginAction } from './guest-login.action';
import { AuthRepository } from '@/domain/repositories/auth-repository';
import { DIContainer } from '@/lib/di-container';
import { GuestLoginResult } from '@/types/auth';
import { redirect } from 'next/navigation';

vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    const err = new Error('NEXT_REDIRECT') as Error & { digest: string };
    err.digest = `NEXT_REDIRECT;replace;${path};307;`;
    throw err;
  }),
}));

/**
 * エラー結果が存在することを検証する
 * @param result - 検証する結果
 */
function expectErrorResultExists(
  result: GuestLoginResult
): asserts result is { success: false; error: string } {
  expect(result.success).toBe(false);
  if (result.success) {
    throw new Error('Expected error result but got success result');
  }
  expect(result.error).toBeTruthy();
}

describe('guestLoginAction 関数', () => {
  let mockRepository: AuthRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    DIContainer.resetForTesting();

    mockRepository = {
      signup: vi.fn(),
      login: vi.fn(),
      signInAnonymously: vi.fn(),
    };
    DIContainer.setAuthRepositoryForTesting(mockRepository);
  });

  it('成功時に /top へリダイレクトする', async () => {
    vi.mocked(mockRepository.signInAnonymously).mockResolvedValue({
      id: 'guest-1',
      email: '',
      createdAt: new Date(),
    });

    await expect(guestLoginAction(null)).rejects.toThrow('NEXT_REDIRECT');
    expect(vi.mocked(redirect)).toHaveBeenCalledWith('/top');
    expect(mockRepository.signInAnonymously).toHaveBeenCalledOnce();
  });

  it('予期しないエラー時にエラーメッセージを返す', async () => {
    vi.mocked(mockRepository.signInAnonymously).mockRejectedValue(
      new Error('GUEST_LOGIN_FAILED')
    );

    const result = await guestLoginAction(null);

    expectErrorResultExists(result);
    expect(result.error).toBe('ゲストログインに失敗しました');
  });
});
