import { User } from "@/domain/repositories/auth-repository";

// 出力データ(Resultパターン)
export type SignupResult =
    | { success: true; user: User }
    | { success: false; error: string };

// ログイン用出力データ(Resultパターン)
export type LoginResult =
    | { success: true; user: User }
    | { success: false; error: string }