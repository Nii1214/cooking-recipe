// npm run test:run -- src/usecase/auth/guest-login.usecase.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GuestLoginUseCase } from './guest-login.usecase';
import { AuthRepository } from '@/domain/repositories/auth-repository';

describe('GuestLoginUseCase クラス', () => {
  let mockRepo: AuthRepository;
  let useCase: GuestLoginUseCase;

  beforeEach(() => {
    mockRepo = {
      signup: vi.fn(),
      login: vi.fn(),
      signInAnonymously: vi.fn(),
    };
    useCase = new GuestLoginUseCase(mockRepo);
  });

  it('匿名サインイン成功時にユーザー情報を返す', async () => {
    vi.mocked(mockRepo.signInAnonymously).mockResolvedValue({
      id: 'guest-1',
      email: '',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    });

    const result = await useCase.execute();

    expect(result).toEqual({
      success: true,
      user: {
        id: 'guest-1',
        email: '',
        createdAt: new Date('2024-01-01T00:00:00Z'),
      },
    });
    expect(mockRepo.signInAnonymously).toHaveBeenCalledOnce();
  });

  it('リポジトリエラー時に例外をスローする', async () => {
    vi.mocked(mockRepo.signInAnonymously).mockRejectedValue(new Error('GUEST_LOGIN_FAILED'));

    await expect(useCase.execute()).rejects.toThrow('GUEST_LOGIN_FAILED');
  });
});
