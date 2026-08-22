// npm run test:run -- src/usecase/auth/signup-usecase.test.ts
// npm run test:coverage -- --coverage.include='src/usecase/auth/signup-usecase.ts' src/usecase/auth/signup-usecase.test.ts
import { describe, expect, it, vi } from "vitest";
import type { User } from "@/domain/repositories/auth-repository";
import { signupUsecase } from "./signup-usecase";
import { signupDepsForTest } from "./signup-deps-for-test";

describe("signupUsecase 関数", () => {
    const mockUser: User = {
        id: "user-1",
        email: "test@example.com",
        createdAt: new Date("2024-01-01T00:00:00Z"),
    };

    it("メール形式が不正なら success: false でエラーメッセージを返す", async () => {
        const deps = signupDepsForTest();

        const result = await signupUsecase({ email: "invalid", password: "password123" }, deps);

        expect(result.success).toBe(false);
        if (!result.success) expect(result.error).toContain("メールアドレス");
        expect(deps.signup).not.toHaveBeenCalled();
    });

    it("パスワードが8文字未満なら success: false でエラーメッセージを返す", async () => {
        const deps = signupDepsForTest();

        const result = await signupUsecase({ email: "test@example.com", password: "1234567" }, deps);

        expect(result.success).toBe(false);
        if (!result.success) expect(result.error).toContain("8文字以上");
        expect(deps.signup).not.toHaveBeenCalled();
    });

    it("バリデーションを通過すると signup を呼び success: true でユーザーを返す", async () => {
        const deps = signupDepsForTest({
            signup: vi.fn().mockResolvedValue(mockUser),
        });

        const result = await signupUsecase({ email: "test@example.com", password: "password123" }, deps);

        expect(result.success).toBe(true);
        if (result.success) expect(result.user).toEqual(mockUser);
        expect(deps.signup).toHaveBeenCalledWith({
            email: "test@example.com",
            password: "password123",
        });
    });

    it("signup が例外を投げたらそのまま throw する", async () => {
        const deps = signupDepsForTest({
            signup: vi.fn().mockRejectedValue(new Error("email_exists")),
        });

        await expect(
            signupUsecase({ email: "test@example.com", password: "password123" }, deps),
        ).rejects.toThrow("email_exists");
    });
});
