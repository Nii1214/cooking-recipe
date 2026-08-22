// npm run test:run -- src/usecase/auth/login-usecase.test.ts
// npm run test:coverage -- --coverage.include='src/usecase/auth/login-usecase.ts' src/usecase/auth/login-usecase.test.ts
import { describe, expect, it, vi } from "vitest";
import type { User } from "@/domain/repositories/auth-repository";
import { loginUsecase } from "./login-usecase";
import { loginDepsForTest } from "./login-deps-for-test";

describe("loginUsecase 関数", () => {
    const mockUser: User = {
        id: "user-1",
        email: "test@example.com",
        createdAt: new Date("2024-01-01T00:00:00Z"),
    };

    it("メール形式が不正なら success: false でエラーメッセージを返す", async () => {
        const deps = loginDepsForTest();

        const result = await loginUsecase({ email: "invalid", password: "password" }, deps);

        expect(result.success).toBe(false);
        if (!result.success) expect(result.error).toContain("メールアドレス");
        expect(deps.login).not.toHaveBeenCalled();
    });

    it("パスワードが空なら success: false でエラーメッセージを返す", async () => {
        const deps = loginDepsForTest();

        const result = await loginUsecase({ email: "test@example.com", password: "" }, deps);

        expect(result.success).toBe(false);
        if (!result.success) expect(result.error).toContain("パスワード");
        expect(deps.login).not.toHaveBeenCalled();
    });

    it("バリデーションを通過すると login を呼び success: true でユーザーを返す", async () => {
        const deps = loginDepsForTest({
            login: vi.fn().mockResolvedValue(mockUser),
        });

        const result = await loginUsecase({ email: "test@example.com", password: "password" }, deps);

        expect(result.success).toBe(true);
        if (result.success) expect(result.user).toEqual(mockUser);
        expect(deps.login).toHaveBeenCalledWith({
            email: "test@example.com",
            password: "password",
        });
    });

    it("login が例外を投げたらそのまま throw する", async () => {
        const deps = loginDepsForTest({
            login: vi.fn().mockRejectedValue(new Error("network error")),
        });

        await expect(
            loginUsecase({ email: "test@example.com", password: "password" }, deps),
        ).rejects.toThrow("network error");
    });
});
