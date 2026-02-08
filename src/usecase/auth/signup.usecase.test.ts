import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignupUseCase } from './signup.usecase';
import type { AuthRepository } from '@/domain/repositories/auth-repository';
import type { User } from '@/domain/repositories/auth-repository';

describe('SignupUseCase', () => {
  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    createdAt: new Date(),
  };

  let mockRepo: AuthRepository;

  beforeEach(() => {
    mockRepo = {
      login: vi.fn(),
      signup: vi.fn().mockResolvedValue(mockUser),
      findByEmail: vi.fn(),
    };
  });

  it('メール形式が不正なら success: false でエラーメッセージを返す', async () => {
    const useCase = new SignupUseCase(mockRepo);
    const result = await useCase.execute({ email: 'invalid', password: 'password123' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain('メールアドレス');
    expect(mockRepo.signup).not.toHaveBeenCalled();
  });

  it('パスワードが8文字未満なら success: false でエラーメッセージを返す', async () => {
    const useCase = new SignupUseCase(mockRepo);
    const result = await useCase.execute({ email: 'test@example.com', password: '1234567' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain('8文字以上');
    expect(mockRepo.signup).not.toHaveBeenCalled();
  });

  it('バリデーションを通過するとリポジトリを呼び success: true でユーザーを返す', async () => {
    const useCase = new SignupUseCase(mockRepo);
    const result = await useCase.execute({ email: 'test@example.com', password: 'password123' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.user).toEqual(mockUser);
    expect(mockRepo.signup).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});