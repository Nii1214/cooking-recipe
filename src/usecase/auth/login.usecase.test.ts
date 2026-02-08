import { AuthRepository, User } from "@/domain/repositories/auth-repository";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginUseCase } from "./login.usecase";

describe('LoginUseCase', () => {
    // ログイン成功時のユーザー情報
    const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        createdAt: new Date()
    };

    let mockRepo: AuthRepository;
    
    // テストごとの初期化
    beforeEach(() => {
        mockRepo = {
            login: vi.fn().mockResolvedValue(mockUser),
            signup: vi.fn(),
            findByEmail: vi.fn(),
        };
    });

    it('メール形式が不正ならsuccess: falseでエラーメッセージを返す', async () => {
        // テスト対象の準備
        const useCase = new LoginUseCase(mockRepo);
        // 実行
        const result = await useCase.execute({ email: 'invalid', password: 'password' });
        // 失敗したか
        expect(result.success).toBe(false);
        // エラーメッセージは適切か
        if (!result.success) expect(result.error).toContain('メールアドレス');
        // インフラ層にアクセスしていないか
        expect(mockRepo.login).not.toHaveBeenCalled();
    });

    it('パスワードが空ならsuccess: falseでエラーメッセージを返す', async () => {
        const useCase = new LoginUseCase(mockRepo);
        const result = await useCase.execute({ email: 'test@example.com', password: '' });
        expect(result.success).toBe(false);
        if (!result.success) expect(result.error).toContain('パスワード');
        expect(mockRepo.login).not.toHaveBeenCalled();
    });

    it('バリデーションを通過するとリポジトリを呼び success: true でユーザーを返す', async() => {
      const useCase = new LoginUseCase(mockRepo);
      const result = await useCase.execute({ email: 'test@example.com', password: 'password' });
      expect(result.success).toBe(true);
      if(result.success){
        expect(result.user).toEqual(mockUser);
      }
      expect(mockRepo.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
    })

    it('リポジトリが例外を投げたらそのままthrowする',async() => {
      vi.mocked(mockRepo.login).mockRejectedValue(new Error('network error'));
      const useCase = new LoginUseCase(mockRepo);
      await expect(
        useCase.execute({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow('network error');
    });
});