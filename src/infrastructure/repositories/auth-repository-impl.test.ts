import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthRepositoryImpl } from './auth-repository-impl';
import { AuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

//npm run test -- src/infrastructure/repositories/auth-repository-impl.test.ts

// Supabaseクライアント全体をモック化
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(),
}));
  
describe('AuthRepositoryImpl', () => {
    let repository: AuthRepositoryImpl;
    let mockSupabaseClient: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    repository = new AuthRepositoryImpl();

    // モックSupabaseクライアントの定義
    mockSupabaseClient = {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
      },
    };

    // createClientがモックSupabaseを返すように設定
    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient);
  });
  
    describe('signup(サインアップ)', () => {
      it('成功時にUserオブジェクトを返す', async () => {
        const mockUser = {
          id: 'test-user-id',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00Z',
        };
  
        mockSupabaseClient.auth.signUp.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });
  
        const result = await repository.signup({
          email: 'test@example.com',
          password: 'password123',
        });
  
        expect(result).toEqual({
          id: 'test-user-id',
          email: 'test@example.com',
          createdAt: new Date('2024-01-01T00:00:00Z'),
        });
  
        expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
  
      it('Supabaseエラー時にエラーをスローする', async () => {
        const authError = new AuthError('Email exists', 400, 'email_exists');
  
        mockSupabaseClient.auth.signUp.mockResolvedValue({
          data: { user: null },
          error: authError,
        });
  
        await expect(
          repository.signup({
            email: 'existing@example.com',
            password: 'password123',
          })
        ).rejects.toThrow(authError);
      });
  
      it('data.userがnullの場合にSIGNUP_FAILEDエラーをスローする', async () => {
        mockSupabaseClient.auth.signUp.mockResolvedValue({
          data: { user: null },
          error: null,
        });
  
        await expect(
          repository.signup({
            email: 'test@example.com',
            password: 'password123',
          })
        ).rejects.toThrow('SIGNUP_FAILED');
      });
    });
  
    describe('login(ログイン)', () => {
      it('成功時にUserオブジェクトを返す', async () => {
        const mockUser = {
          id: 'test-user-id',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00Z',
        };
  
        mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });
  
        const result = await repository.login({
          email: 'test@example.com',
          password: 'password123',
        });
  
        expect(result).toEqual({
          id: 'test-user-id',
          email: 'test@example.com',
          createdAt: new Date('2024-01-01T00:00:00Z'),
        });
  
        expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
  
      it('Supabaseエラー時にエラーをスローする', async () => {
        const authError = new AuthError('Invalid credentials', 400, 'invalid_credentials');
  
        mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: null },
          error: authError,
        });
  
        await expect(
          repository.login({
            email: 'wrong@example.com',
            password: 'wrongpassword',
          })
        ).rejects.toThrow(authError);
      });
  
      it('data.userがnullの場合にLOGIN_FAILEDエラーをスローする', async () => {
        mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: null },
          error: null,
        });
  
        await expect(
          repository.login({
            email: 'test@example.com',
            password: 'password123',
          })
        ).rejects.toThrow('LOGIN_FAILED');
      });
    });
  
    describe('findByEmail', () => {
      it('現在はnullを返す（将来の拡張用）', async () => {
        const result = await repository.findByEmail('test@example.com');
        expect(result).toBeNull();
      });
    });
});