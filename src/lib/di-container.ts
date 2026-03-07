import { AuthRepository } from "@/domain/repositories/auth-repository";
import { AuthRepositoryImpl } from "@/infrastructure/repositories/auth-repository-impl";
import { LoginUseCase } from "@/usecase/auth/login.usecase";
import { SignupUseCase } from "@/usecase/auth/signup.usecase";

/**
 * 依存性注入コンテナ
 * 
 * @remarks
 * - Server Actions用：リクエストごとに新しいインスタンスを生成
 * - テスト用：モックインスタンスを注入可能
 */
export class DIContainer {

    // テスト環境用のモックインスタンス（テスト時のみ使用）
    private static testAuthRepository?: AuthRepository;

    /**
     * AuthRepositoryのインスタンスを取得
     * 本番環境では毎回新しいインスタンスを生成
     * テスト環境ではモックインスタンスを返却
     */
    static getAuthRepository(): AuthRepository {
        if (this.testAuthRepository) {
            return this.testAuthRepository;
        }
        // 本番環境：リクエストごとに新しいインスタンスを生成
        return new AuthRepositoryImpl();
    }

    /**
     * LoginUseCaseのインスタンスを取得
     */
    static getLoginUseCase(): LoginUseCase {
        return new LoginUseCase(this.getAuthRepository());
    }

    /**
     * SignupUseCaseのインスタンスを取得
     */
    static getSignupUseCase(): SignupUseCase {
        return new SignupUseCase(this.getAuthRepository());
    }

    // ============================================
    // テスト用メソッド
    // ============================================

    /**
     * テスト用：AuthRepositoryのモックを設定
     * @internal テストコードからのみ使用すること
     */
    static setAuthRepositoryForTesting(repository: AuthRepository) {
        this.testAuthRepository = repository;
    }

    /**
     * テスト用：全てのモックをクリア
     * @internal 各テストの beforeEach で呼び出すこと
     */
    static resetForTesting() {
        this.testAuthRepository = undefined;
    }
}