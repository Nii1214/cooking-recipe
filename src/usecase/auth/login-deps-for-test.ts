import { vi } from "vitest";
import type { User } from "@/domain/repositories/auth-repository";
import type { LoginDeps } from "./login-usecase";

/**
 * テスト用の LoginDeps を生成する
 * @param overrides 差し替えたい依存操作
 * @returns モック済みの LoginDeps
 */
export function loginDepsForTest(
    overrides: Partial<LoginDeps> = {},
): LoginDeps {
    const mockUser: User = {
        id: "user-1",
        email: "test@example.com",
        createdAt: new Date("2024-01-01T00:00:00Z"),
    };

    return {
        login: vi.fn().mockResolvedValue(mockUser),
        ...overrides,
    };
}
