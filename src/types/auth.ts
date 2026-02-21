import { User } from "@/domain/repositories/auth-repository";

export type AuthResult =
    | { success: true; user: User }
    | { success: false; error: string };

// エイリアス
export type SignupResult = AuthResult;
export type LoginResult = AuthResult;