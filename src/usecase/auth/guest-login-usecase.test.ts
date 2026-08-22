// npm run test:run -- src/usecase/auth/guest-login-usecase.test.ts
import { describe, expect, it, vi } from "vitest";
import { guestLoginUsecase } from "./guest-login-usecase";
import { guestLoginDepsForTest } from "./guest-login-deps-for-test";

describe("guestLoginUsecase 関数", () => {
    it("匿名サインイン成功時にユーザー情報を返す", async () => {
        const deps = guestLoginDepsForTest();

        const result = await guestLoginUsecase(deps);

        expect(result).toEqual({
            success: true,
            user: {
                id: "guest-1",
                email: "",
                createdAt: new Date("2024-01-01T00:00:00Z"),
            },
        });
        expect(deps.signInAnonymously).toHaveBeenCalledOnce();
    });

    it("signInAnonymously が例外を投げたらそのまま throw する", async () => {
        const deps = guestLoginDepsForTest({
            signInAnonymously: vi.fn().mockRejectedValue(new Error("GUEST_LOGIN_FAILED")),
        });

        await expect(guestLoginUsecase(deps)).rejects.toThrow("GUEST_LOGIN_FAILED");
    });
});
