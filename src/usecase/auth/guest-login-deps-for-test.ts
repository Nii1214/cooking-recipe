import { vi } from "vitest";
import type { User } from "@/domain/repositories/auth-repository";
import type { GuestLoginDeps } from "./guest-login-usecase";

/**
 * テスト用の GuestLoginDeps を生成する
 * @param overrides 差し替えたい依存操作
 * @returns モック済みの GuestLoginDeps
 */
export function guestLoginDepsForTest(
    overrides: Partial<GuestLoginDeps> = {},
): GuestLoginDeps {
    const mockGuest: User = {
        id: "guest-1",
        email: "",
        createdAt: new Date("2024-01-01T00:00:00Z"),
    };

    return {
        signInAnonymously: vi.fn().mockResolvedValue(mockGuest),
        ...overrides,
    };
}
