// npm run test:run -- src/infrastructure/repositories/auth-repository-impl.test.ts
// npm run test:coverage -- --coverage.include='src/infrastructure/repositories/auth-repository-impl.ts' src/infrastructure/repositories/auth-repository-impl.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthRepositoryImpl } from './auth-repository-impl';
import { AuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

// Supabaseクライアント全体をモック化
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(),
}));

vi.mock('@/lib/site-url', () => ({
    getSiteOrigin: vi.fn().mockResolvedValue('https://example.com'),
}));
  
describe('AuthRepositoryImpl', () => {
    let repository: AuthRepositoryImpl;
    type MockSupabaseClient = {
      auth: {
        signUp: ReturnType<typeof vi.fn>;
        signInWithPassword: ReturnType<typeof vi.fn>;
        signInAnonymously: ReturnType<typeof vi.fn>;
      };
    };
    let mockSupabaseClient: MockSupabaseClient;
  
  beforeEach(() => {
    vi.clearAllMocks();
    repository = new AuthRepositoryImpl();

    // モックSupabaseクライアントの定義
    mockSupabaseClient = {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signInAnonymously: vi.fn(),
      },
    };

    // createClientがモックSupabaseを返すように設定
    vi.mocked(createClient).mockResolvedValue(
      mockSupabaseClient as unknown as Awaited<ReturnType<typeof createClient>>
    );
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
          options: {
            emailRedirectTo: 'https://example.com/auth/callback',
          },
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

    describe('signInAnonymously 関数', () => {
      it('成功時に User オブジェクトを返す', async () => {
        const mockUser = {
          id: 'guest-user-id',
          email: null,
          created_at: '2024-01-01T00:00:00Z',
        };

        mockSupabaseClient.auth.signInAnonymously.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        const result = await repository.signInAnonymously();

        expect(result).toEqual({
          id: 'guest-user-id',
          email: '',
          createdAt: new Date('2024-01-01T00:00:00Z'),
        });

        expect(mockSupabaseClient.auth.signInAnonymously).toHaveBeenCalled();
      });

      it('Supabase エラー時にエラーをスローする', async () => {
        const authError = new AuthError('Disabled', 400, 'anonymous_provider_disabled');

        mockSupabaseClient.auth.signInAnonymously.mockResolvedValue({
          data: { user: null },
          error: authError,
        });

        await expect(repository.signInAnonymously()).rejects.toThrow(authError);
      });

      it('data.user が null の場合に GUEST_LOGIN_FAILED エラーをスローする', async () => {
        mockSupabaseClient.auth.signInAnonymously.mockResolvedValue({
          data: { user: null },
          error: null,
        });

        await expect(repository.signInAnonymously()).rejects.toThrow('GUEST_LOGIN_FAILED');
      });
    });
});