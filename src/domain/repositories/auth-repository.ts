// ドメインエンティティ(アプリ内ユーザー情報)
export type User = {
    id: string;
    email: string;
    createdAt: Date;
};
// 入力データ
export type SignupInput = {
    email: string;
    password: string;
};
// ログイン用の入力データ
export type LoginInput = {
    email: string,
    password: string,
}

export interface AuthRepository {
    signup(input: SignupInput): Promise<User>;
    login(input: LoginInput) : Promise<User>;
    findByEmail(email: string): Promise<User | null>;
}