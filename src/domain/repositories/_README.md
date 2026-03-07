# `src/domain/repositories` について

## 一言でいうと

> **「何ができるか」だけを宣言する場所です。「どうやるか」はここに書きません。**
>
> 例えば「レシピを ID で取得できる」「レシピを保存できる」という**操作の一覧（インターフェース）**を TypeScript の型で書くのがこのディレクトリです。
> 実際に Supabase を使って取得・保存する実装は `src/infrastructure/repositories/` に書きます。

---

## なぜこの層があるの？

> 💡 **「インターフェース（契約）」とは？**  
> 「こういうことができる何かを用意してください」という約束のことです。  
> たとえば「`getRecipeById(id)` を呼んだら `Recipe` が返ってくる」という約束を型で表します。  
> その約束を**誰が・どうやって**実装するかは、ここでは決めません。

usecase 層はレシピの取得・保存などの操作を必要とします。  
でも usecase が「Supabase でこうやって取得する」というコードを直接持ってしまうと…

- **Supabase を別の DB に変えたいとき**: usecase のコードも変える必要が出る
- **テストを書きたいとき**: 本物の DB なしで usecase が動かせない

`domain/repositories` にインターフェースを置くことで、usecase は「こういうことができる何かに頼む」とだけ書けばよくなります。  
具体的な実装（Supabase）は外側（infrastructure）が担い、usecase に「渡して」あげます。  
**これが「依存性の逆転」と呼ばれるパターンです。**

---

## 概要

- **リポジトリのインターフェース（契約）の定義** … 永続化・外部サービスとのやりとりに必要な操作を型として宣言します
- **リポジトリ専用の型の定義** … メソッドの引数・戻り値用の入出力 DTO などをここに置きます。エンティティは `src/domain/models/` に定義し、必要に応じてここから参照します
- **依存性の逆転の起点** … usecase 層はこのインターフェースにのみ依存し、実装（インフラ層）に依存しないようにします

---

## やること・やらないこと（早引き）

| ✅ やってよいこと | ❌ やってはいけないこと |
|-----------------|----------------------|
| インターフェース（`interface`）と型（`type`）を定義する | DB アクセス・API 呼び出しの実装を書く |
| `domain/models/` の型を引数・戻り値に使う | Supabase・Prisma などのライブラリの型を使う |
| 同ディレクトリ内の型を参照する | `@/infrastructure`, `@/usecase`, `@/app`, `@/lib` などを import する |
| メソッドのシグネチャを定義する | ログやキャッシュの実装を含める |

---

## 配置方針

- このディレクトリには **インターフェースと型のみ** を置きます。具体的な実装（DB アクセス・API 呼び出しなど）は置きません
- 実装は `src/infrastructure/repositories/` に配置します
- エンティティなどドメインモデルは `src/domain/models/` に置き、リポジトリの契約（戻り値など）ではその型を利用します

---

## 命名規則

- **ファイル名** … `{関心事}-repository.ts`（例: `auth-repository.ts`）
- **インターフェース名** … `{関心事}Repository`（例: `AuthRepository`）

---

## 依存のルール

`domain/repositories` は `domain/models` と同様に**内側の層**です。  
外側のライブラリに依存すると、ライブラリ変更の影響がインターフェースにまで及んでしまいます。

### 依存してよいもの

- **同ディレクトリ内の他のファイル** … `import type { SomeType } from './other-repository'` のように、同じディレクトリ内の型のみ
- **`src/domain/models/`** … `import type { User } from '@/domain/models/user'` のように、ドメインモデルを参照できます
- **TypeScript / JavaScript 組み込み** … `Date`, `Promise`, `string`, `number` などはそのまま使えます

### 依存してはいけないもの

- プロジェクト内の他層すべて: `@/infrastructure/*`, `@/usecase/*`, `@/app/*`, `@/lib/*`, `@/presentation/*`, `@/hooks/*`, `@/utils/*`, `@/types/*`
- フレームワーク: React, Next.js など
- ランタイムの実装が入るパッケージ: Supabase クライアント、HTTP クライアント、DB ドライバなど

---

## やってはいけないこと（詳細）

- **実装を書かない** … インターフェースと型のみを置きます。DB アクセス・API 呼び出し・ファイル I/O はインフラ層に書きます
- **契約にフレームワーク固有の型を載せない** … リポジトリのメソッドの引数・戻り値は Next.js や Supabase に依存した型にしません。プレーンな型・このディレクトリで定義した型・`domain/models` の型だけを使います
- **インターフェースに実装の都合を漏らさない** … ログ・メトリクス・キャッシュの有無などは契約に含めず、「何ができるか」だけを表します

---

## コード例

### ✅ よい例：「何ができるか」だけを型で宣言する

```ts
// auth-repository.ts
import type { User } from "@/domain/models/user";

// 入出力の型をここで定義する
export type SignupInput = {
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

// インターフェース：「こういうことができる何かを用意してください」という約束
export interface AuthRepository {
  signup(input: SignupInput): Promise<User>;
  login(input: LoginInput): Promise<User>;
}
```

### ❌ NG 例：実装の詳細や外部ライブラリをインターフェースに含める

```ts
// ❌ NG: Supabase のレスポンス型をそのまま戻り値にしている
import { PostgrestResponse } from "@supabase/supabase-js";

export interface RecipeRepository {
  getRecipeById(id: string): Promise<PostgrestResponse<Recipe>>;
  // ↑ Supabase 固有の型が契約に入ると、Supabase を変えたときにここも変える必要が出る
}

// ❌ NG: 実装（DB アクセス）をここに書いている
export class RecipeRepository {
  async getRecipeById(id: string): Promise<Recipe> {
    const { data } = await supabase.from("recipes").select().eq("id", id);
    // ↑ domain/repositories に実装を書いてはいけない。infrastructure に書く
    return data;
  }
}
```
