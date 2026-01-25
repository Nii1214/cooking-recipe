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

// 出力データ(Resultパターン)
export type SignupResult = 
    | { success: true; user: User}
    | { success: false; error: string};
