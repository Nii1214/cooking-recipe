import type { User } from "@/domain/repositories/auth-repository";
import type { GuestLoginResult } from "@/types/auth";

/**
 * ゲスト（匿名）ログインユースケースが依存する処理。
 * action 層で infrastructure の実装を渡す。
 */
export type GuestLoginDeps = {
    signInAnonymously: () => Promise<User>;
};

/**
 * 匿名サインインを実行する
 * @param deps 依存するリポジトリ操作
 * @returns 成功時はユーザー情報
 */
export const guestLoginUsecase = async (
    deps: GuestLoginDeps,
): Promise<GuestLoginResult> => {
    const user = await deps.signInAnonymously();
    return { success: true, user };
};
