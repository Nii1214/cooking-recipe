import { LoginUseCase } from "@/usecase/auth/login.usecase";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginAction } from "./login.action";
import { AuthRepository } from "@/domain/repositories/auth-repository";
import { DIContainer } from "@/lib/di-container";

vi.mock('next/navigation', () => ({
    redirect: vi.fn((path: string) => {
        throw new Error(`REDIRECT:${path}`);
    }),
}));

describe('loginAction(ログイン処理)',() => {
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

    it('ログイン成功時に/topへリダイレクトする',async() => {
        // Repositoryのモックを設定
        vi.mocked(mockRepository.login).mockResolvedValue({
            id: 'test-id',
            email: 'test@example.com',
            createdAt: new Date('2024-01-01')
        });

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');

        await expect(loginAction(null,formData)).rejects.toThrow('REDIRECT:/top');

        // Repositoryのloginが正しい引数で呼ばれたことを検証
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

        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
    });

    it('メールアドレス形式が不正な場合にバリデーションエラー', async () => {
        // UseCaseでバリデーションされるため、Repositoryは呼ばれない
        const formData = new FormData();
        formData.append('email', 'invalid-email');
        formData.append('password', 'password123');

        const result = await loginAction(null, formData);

        expect(result.success).toBe(false);
        expect(result.error).toBe('メールアドレスの形式が正しくありません');
        
        // Repositoryが呼ばれていないことを検証
        expect(mockRepository.login).not.toHaveBeenCalled();
    });

    it('パスワードが空の場合にバリデーションエラー', async () => {
        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', '');

        const result = await loginAction(null, formData);

        expect(result.success).toBe(false);
        expect(result.error).toBe('パスワードを入力してください');
        expect(mockRepository.login).not.toHaveBeenCalled();
    });

    it('FormDataが空の場合にバリデーションエラー', async () => {
        const formData = new FormData();

        const result = await loginAction(null, formData);

        expect(result.success).toBe(false);
        expect(mockRepository.login).not.toHaveBeenCalled();
    });
});