// npm run test:run -- src/lib/di-container.test.ts
// npm run test:coverage -- --coverage.include='src/lib/di-container.ts' src/lib/di-container.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DIContainer } from "./di-container";
import { AuthRepository } from "@/domain/repositories/auth-repository";
import { AuthRepositoryImpl } from "@/infrastructure/repositories/auth-repository-impl";
import { LoginUseCase } from "@/usecase/auth/login.usecase";
import { SignupUseCase } from "@/usecase/auth/signup.usecase";
import { GuestLoginUseCase } from "@/usecase/auth/guest-login.usecase";

describe("DIContainer", () => {
  beforeEach(() => {
    DIContainer.resetForTesting();
  });

  it("getAuthRepository は本番では AuthRepositoryImpl を返す", () => {
    const repo = DIContainer.getAuthRepository();
    expect(repo).toBeInstanceOf(AuthRepositoryImpl);
  });

  it("setAuthRepositoryForTesting でモックを注入できる", () => {
    const mock: AuthRepository = {
      login: vi.fn(),
      signup: vi.fn(),
      signInAnonymously: vi.fn(),
    };
    DIContainer.setAuthRepositoryForTesting(mock);

    expect(DIContainer.getAuthRepository()).toBe(mock);
  });

  it("getLoginUseCase / getSignupUseCase / getGuestLoginUseCase を返す", () => {
    expect(DIContainer.getLoginUseCase()).toBeInstanceOf(LoginUseCase);
    expect(DIContainer.getSignupUseCase()).toBeInstanceOf(SignupUseCase);
    expect(DIContainer.getGuestLoginUseCase()).toBeInstanceOf(GuestLoginUseCase);
  });

  it("resetForTesting でモックをクリアする", () => {
    const mock: AuthRepository = { login: vi.fn(), signup: vi.fn(), signInAnonymously: vi.fn() };
    DIContainer.setAuthRepositoryForTesting(mock);
    DIContainer.resetForTesting();

    expect(DIContainer.getAuthRepository()).toBeInstanceOf(AuthRepositoryImpl);
  });
});
