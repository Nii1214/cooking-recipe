# `src/infrastructure/repositories` について

## 一言でいうと

> **実際に Supabase（DB）と話す場所です。**
>
> `domain/repositories` で「こういうことができる何かを用意してください」と宣言した約束（インターフェース）を、  
> Supabase を使って**実際に実現する**のがこのディレクトリです。

---

## なぜこの層があるの？

`domain/repositories` でインターフェースを宣言しているのに、なぜ別のディレクトリに実装を書くのでしょうか？

理由は**「DB の詳細をここに閉じ込めるため」**です。

- `recipes` テーブルのカラムが `thumbnail_url`（snake_case）でも、ドメインモデルに変換して `thumbnailUrl` で返せます
- Supabase を別の DB に変えたいとき、**変えるのはこのディレクトリだけ**で済みます。usecase や domain は一切触らなくてよいです
- テスト時は、このディレクトリの代わりに「テスト用の偽の実装」を渡すだけでよく、**本物の DB なしで usecase をテストできます**

> 💡 **「依存性の逆転の受け手」とは？**  
> 普通に考えると「usecase が infrastructure を使う（依存する）」ですが、  
> このアーキテクチャでは「usecase は契約（インターフェース）だけを知っている」状態にし、  
> infrastructure（実装）を app 層から deps として渡します。  
> usecase → infrastructure という依存が、usecase → 契約 ← infrastructure と逆転します。  
> このため infrastructure は「依存性の逆転の受け手」と呼ばれます。

---

## 概要

- **リポジトリの実装** … `src/domain/repositories/` で定義したインターフェース（契約）を、実際の DB アクセス・外部 API 呼び出しで実装します
- **永続化の詳細のカプセル化** … Supabase のテーブル名・カラム名・snake_case とドメインモデルの camelCase の変換など、永続化にまつわる詳細をここに閉じます
- **依存性の逆転の受け手** … usecase 層はドメインのインターフェースに依存し、この実装を app 層から deps として渡すことで、具体的な DB や API に依存しない構成にします

---

## やること・やらないこと（早引き）

| ✅ やってよいこと | ❌ やってはいけないこと |
|-----------------|----------------------|
| インターフェースのメソッドを Supabase で実装する | `@/usecase/*` を import する |
| DB の snake_case をドメインの camelCase に変換する | ビジネスロジック（「いつ保存するか」など）を書く |
| DB エラーを throw する | `@/app/*`, `@/presentation/*` を import する |
| `@/lib/` のクライアントを使って DB にアクセスする | ドメインモデルの型をここで新しく定義する |

---

## 配置方針

- このディレクトリには **リポジトリの実装のみ** を置きます。契約（インターフェース・入出力型）は `src/domain/repositories/` に定義します
- **ドメインの文脈に合わせてサブディレクトリ**で分けます（例: `recipe/`, `auth/`）。`domain/repositories` の構成と対応させます
- 1 ファイルに 1 リポジトリ実装を置くか、関連する実装を同一サブディレクトリにまとめます

---

## 命名規則

### ファイル名・実装名

- **ファイル名** … `{関心事}-repository-impl.ts`（例: `recipe-repository-impl.ts`, `auth-repository-impl.ts`）
- **クラスで実装する場合** … `{関心事}RepositoryImpl`（例: `AuthRepositoryImpl`）
- **関数で実装する場合** … 下記のメソッド命名規則に合わせた関数名（例: `createRecipe`, `saveIngredients`）

### メソッド・関数の命名（永続化の意図を表す）

- **create〇〇** … `INSERT` のみ行う場合。新規作成のときのメソッド名に使います（例: `createRecipe`）
- **save〇〇** … 「既存データを `DELETE` したうえで、改めて `INSERT` する」場合。レシピの手順・材料のように、更新では対応できず「一度消してから並び順込みで入れ直す」要件を満たすための表現です（例: `saveIngredients`, `saveInstructions`）
- **get〇〇 / find〇〇** … 参照（`SELECT`）する場合。1 件を返すときは `get〇〇` または `get〇〇ById`、条件で検索するときは `find〇〇` や `find〇〇By〇〇` を使います（例: `getRecipeById`, `findRecipesByAuthorId`）
- **update〇〇** … 既存レコードを `UPDATE` する場合（例: `updateRecipe`）
- **delete〇〇** … レコードを `DELETE` する場合（例: `deleteRecipeById`, `deleteIngredientsByRecipeId`）

---

## 依存のルール

### 依存してよいもの

- **`src/domain/repositories/`** … 実装するインターフェース・入出力型を import します（例: `import type { RecipeInput } from '@/domain/repositories/recipe/recipe-repository'`）
- **`src/domain/models/`** … ドメインモデル（エンティティなど）を import します（例: `import type { Recipe } from '@/domain/models/recipe/recipe'`）
- **`src/lib/`** … DB クライアント・API クライアントのラッパーなど、外部サービスへの接続を提供するモジュール（例: `import { createAuthedClient } from '@/lib/supabase/server'`）
- **TypeScript / JavaScript の組み込み** … `Date`, `Promise`, `string`, `number` などはそのまま使えます

### 依存してはいけないもの

- **`@/usecase/*`** … ユースケース層に依存しません。依存方向は usecase → infrastructure（インターフェース経由）です
- **`@/app/*`**, **`@/presentation/*`**, **`@/hooks/*`** … UI 層に依存しません
- **`@/types/*`**, **`@/utils/*`** … ドメインで解決できる型・ロジックはドメイン側に置き、インフラは契約とモデルに従うだけにします

---

## やってよいこと・やってはいけないこと（詳細）

### やってよいこと

- **契約の実装** … ドメインのリポジトリインターフェースで宣言されたメソッドを、Supabase や HTTP クライアントを使って実装します
- **スキーマのマッピング** … DB の snake_case（例: `thumbnail_url`）とドメインの camelCase（例: `thumbnailUrl`）の変換をこの層で行います。`select()` の結果をドメインモデルの形に組み替えて返します
- **エラーの伝搬** … DB エラーや API エラーをキャッチし、そのまま throw するか、契約に沿った形のエラーに変換して throw します

### やってはいけないこと

- **契約を変更しない** … インターフェースのシグネチャや戻り値の型は `domain/repositories` の定義に従います。実装の都合で引数や戻り値を増やしません
- **ドメインの型を定義しない** … エンティティや入出力 DTO の型は `domain/models` および `domain/repositories` に定義し、ここでは import して使うだけにします
- **ビジネスロジックを書かない** … 「いつ保存するか」「どの順で呼ぶか」はユースケース層の責務です。この層は「渡されたデータを永続化する」ことに専念します

---

## コード例

### ✅ よい例：ドメインの契約を実装し、DB の詳細を変換して返す

```ts
// recipe/recipe-repository-impl.ts
import type { Recipe } from "@/domain/models/recipe/recipe";
import type { RecipeInput } from "@/domain/repositories/recipe/recipe-repository";
import { createAuthedClient } from "@/lib/supabase/server";

export const createRecipe = async (input: RecipeInput): Promise<Recipe> => {
  const { supabase, user } = await createAuthedClient();

  const { data, error } = await supabase
    .from("recipes")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("INSERT_FAILED");

  // DB の snake_case をドメインモデルの camelCase に変換して返す
  return {
    ...data,
    thumbnailUrl: data.thumbnail_url,       // snake_case → camelCase
    servingCount: data.serving_count,
    preparationTimeMinutes: data.preparation_time_minutes,
    authorId: data.user_id,
    ingredients: [],
    instructions: [],
    categories: [],
    createdAt: new Date(data.created_at),   // 文字列 → Date
    updatedAt: new Date(data.updated_at),
  };
};
```

クラスで実装する場合の例（`AuthRepository` インターフェースを実装）:

```ts
// auth-repository-impl.ts
import type { AuthRepository, LoginInput, SignupInput, User } from "@/domain/repositories/auth-repository";
import { createClient } from "@/lib/supabase/server";

export class AuthRepositoryImpl implements AuthRepository {
  async signup(input: SignupInput): Promise<User> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });
    if (error) throw error;
    if (!data.user) throw new Error("SIGNUP_FAILED");
    return {
      id: data.user.id,
      email: data.user.email!,
      createdAt: new Date(data.user.created_at),
    };
  }

  async login(input: LoginInput): Promise<User> {
    // ...
  }
}
```

### ❌ NG 例：ビジネスロジックをここに書く

```ts
// ❌ NG: 「どの順で保存するか」という業務ルールをインフラ層に書いている
export const createRecipeWithIngredients = async (input: RecipeInput): Promise<Recipe> => {
  const recipe = await supabase.from("recipes").insert(input).single();
  // ↑ usecase の仕事（複数リポジトリを組み合わせる）をここでやっている
  await supabase.from("ingredients").insert(
    input.ingredients.map((i) => ({ ...i, recipe_id: recipe.data.id }))
  );
  return recipe.data;
};
// → 業務ロジックを変えたいとき、infrastructure 層を変える必要が生じてしまう
```
