# `src/infrastructure/repositories`について

## 概要
このディレクトリは以下の役割がある。
- **リポジトリの実装** … `src/domain/repositories/` で定義したインターフェース（契約）を、実際の DB アクセス・外部 API 呼び出しで実装する
- **永続化の詳細のカプセル化** … Supabase のテーブル名・カラム名・snake_case とドメインモデルの camelCase の変換など、永続化にまつわる詳細をここに閉じる
- **依存性の逆転の受け手** … ユースケース層はドメインのインターフェースに依存し、この実装を app 層から deps として渡すことで、具体的な DB や API に依存しない構成にする

## 配置方針
- このディレクトリには **リポジトリの実装のみ** を置く。契約（インターフェース・入出力型）は `src/domain/repositories/` に定義する
- **ドメインの文脈に合わせてサブディレクトリ**で分ける（例: `recipe/`, `auth/`）。`domain/repositories` の構成と対応させる
- 1 ファイルに 1 リポジトリ実装を置くか、関連する実装を同一サブディレクトリにまとめる

## 命名規則

### ファイル名・実装名
- ファイル名: `{関心事}-repository-impl.ts`（例: `recipe-repository-impl.ts`, `auth-repository-impl.ts`）
- クラスで実装する場合: `{関心事}RepositoryImpl`（例: `AuthRepositoryImpl`）
- 関数で実装する場合: 下記のメソッド命名規則に合わせた関数名（例: `createRecipe`, `saveIngredients`）

### メソッド・関数の命名（永続化の意図を表す）
- **create〇〇** … `INSERT` のみ行う場合。新規作成のときのメソッド名に使う（例: `createRecipe`）
- **save〇〇** … 「既存データを `DELETE` したうえで、改めて `INSERT` する」場合。レシピの手順・材料のように、更新では対応できず「一度消してから並び順込みで入れ直す」要件を満たすための表現（例: `saveIngredients`, `saveInstructions`）
- **get〇〇** / **find〇〇** … 参照（`SELECT`）する場合。1 件を返すときは `get〇〇` または `get〇〇ById`、条件で検索するときは `find〇〇` や `find〇〇By〇〇` を使う（例: `getRecipe`, `getRecipeById`, `findRecipesByAuthorId`, `findIngredientsByRecipeId`）
- **update〇〇** … 既存レコードを `UPDATE` する場合。主キーや指定条件に合う行を更新する（例: `updateRecipe`, `updateRecipeTitle`）
- **delete〇〇** … レコードを `DELETE` する場合。1 件削除なら `delete〇〇` または `delete〇〇ById`、関連ごと削除なら `delete〇〇By〇〇` など（例: `deleteRecipe`, `deleteRecipeById`, `deleteIngredientsByRecipeId`）

## 依存のルール（クリーンアーキテクチャの観点）

インフラ層は**ドメインの内側に依存してよく、外側（フレームワーク・UI）には依存しない**。実務的には次の import ルールで守ります。

### 依存してよいもの
- **`src/domain/repositories/`** … 実装するインターフェース・入出力型を import する（例: `import type { RecipeInput } from '@/domain/repositories/recipe/recipe-repository'`）
- **`src/domain/models/`** … ドメインモデル（エンティティなど）を import する（例: `import type { Recipe } from '@/domain/models/recipe/recipe'`）
- **`src/lib/`** … DB クライアント・API クライアントのラッパーなど、外部サービスへの接続を提供するモジュール（例: `import { createAuthedClient } from '@/lib/supabase/server'`）
- **TypeScript / JavaScript の組み込み** … `Date`, `Promise`, `string`, `number` などはそのまま使用してよい

### 依存してはいけないもの
- **`@/usecase/*`** … ユースケース層に依存しない。依存方向は usecase → infrastructure
- **`@/app/*`**, **`@/presentation/*`**, **`@/hooks/*`** … UI 層に依存しない
- **`@/types/*`**, **`@/utils/*`** … ドメインで解決できる型・ロジックはドメイン側に置き、インフラは契約とモデルに従うだけにする

## やってよいこと
- **契約の実装** … ドメインのリポジトリインターフェースで宣言されたメソッドを、Supabase や HTTP クライアントを使って実装する
- **スキーマのマッピング** … DB の snake_case（例: `thumbnail_url`）とドメインの camelCase（例: `thumbnailUrl`）の変換をこの層で行う。`select()` の結果をドメインモデルの形に組み替えて返す
- **エラーの伝搬** … DB エラーや API エラーをキャッチし、そのまま throw するか、契約に沿った形のエラーに変換して throw する

## やってはいけないこと
- **契約を変更しない** … インターフェースのシグネチャや戻り値の型は `domain/repositories` の定義に従う。実装の都合で引数や戻り値を増やさない
- **ドメインの型を定義しない** … エンティティや入出力 DTO の型は `domain/models` および `domain/repositories` に定義し、ここでは import して使うだけにする
- **ビジネスロジックを書かない** … 「いつ保存するか」「どの順で呼ぶか」はユースケース層の責務。この層は「渡されたデータを永続化する」ことに専念する

## コード例

ドメインの契約を満たす実装例です。DB のスキーマ（snake_case）をドメインモデル（camelCase）に変換して返しています。

```ts
// recipe/recipe-repository-impl.ts
import type { Recipe } from "@/domain/models/recipe/recipe";
import type { RecipeInput } from "@/domain/repositories/recipe/recipe-repository";
import { createAuthedClient } from "@/lib/supabase/server";

export const createRecipe = async (input: RecipeInput): Promise<Recipe> => {
  const { supabase, user } = await createAuthedClient();

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      ...input,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("INSERT_FAILED");

  return {
    ...data,
    thumbnailUrl: data.thumbnail_url,
    servingCount: data.serving_count,
    preparationTimeMinutes: data.preparation_time_minutes,
    authorId: data.user_id,
    ingredients: [],
    instructions: [],
    categories: [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
};
```

インターフェースをクラスで実装する場合の例です。

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
