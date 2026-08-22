import { vi } from "vitest";
import type { User } from "@/domain/repositories/auth-repository";
import type { SignupDeps } from "./signup-usecase";

/**
 * テスト用の SignupDeps を生成する
 * @param overrides 差し替えたい依存操作
 * @returns モック済みの SignupDeps
 */
export function signupDepsForTest(
    overrides: Partial<SignupDeps> = {},
): SignupDeps {
    const mockUser: User = {
        id: "user-1",
        email: "test@example.com",
        createdAt: new Date("2024-01-01T00:00:00Z"),
    };

    return {
        signup: vi.fn().mockResolvedValue(mockUser),
        ...overrides,
    };
}
