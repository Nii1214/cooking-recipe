# `src/usecase` について

## 一言でいうと

> **「機能のシナリオ」を書く場所です。**
>
> 「レシピを作成する」という機能は、実は複数のステップから成ります——レシピを保存して、材料を保存して、手順を保存する。  
> **どのリポジトリを・どんな順番で・どう組み合わせるか**、というシナリオを 1 つにまとめるのがこのディレクトリです。

---

## なぜこの層があるの？

> 💡 **「オーケストレーション」とは？**  
> オーケストラの指揮者のように、複数の処理を指示して一つの音楽（機能）を作ること。  
> usecase は複数のリポジトリを順番に呼び出して、一つの機能を実現します。

usecase がなかったとしたら、こんな問題が起きます。

- **app 層（Server Action）にビジネスロジックを直接書いてしまう**  
  → 同じロジックを複数の画面で使いたいとき、コピペが発生する
- **ロジックのテストが書きにくくなる**  
  → Next.js の Server Action の中に全部書くと、テストするのに画面や DB が必要になる

usecase に「機能のシナリオ」を切り出すことで、  
**画面から切り離して「この機能が正しく動くか」をテストできる**状態になります。

---

## 概要

- **アプリケーション固有のユースケース** … 「レシピを作成する」「ユーザーを登録する」など、アプリの振る舞いを 1 つにまとめたオーケストレーションです
- **リポジトリの組み合わせと順序** … どのリポジトリをどの順で呼ぶか、トランザクション的なまとまりをこの層で決めます
- **ドメインの契約への依存** … 永続化の「やり方」には依存せず、`domain/repositories` のインターフェース（契約）にだけ依存します。具体的な実装は app 層から deps として渡してもらいます

---

## やること・やらないこと（早引き）

| ✅ やってよいこと | ❌ やってはいけないこと |
|-----------------|----------------------|
| 複数のリポジトリを組み合わせてシナリオを作る | `@/infrastructure/*` を import する |
| 入力のバリデーション（ビジネスルールに沿ったチェック） | `@/app/*`, `@/presentation/*` を import する |
| `Promise.all` など非同期処理の組み合わせ | `@/lib/*`（Supabase クライアントなど）を直接使う |
| `{ success: true, ... }` / `{ success: false, error }` で返す | 画面用のフォーマット・props の組み立てをする |
| `domain/models`, `domain/repositories`（インターフェース）を import する | DB の型やフレームワーク固有の型に依存する |

---

## 配置方針

- **文脈（関心事）ごとにサブディレクトリ**で分けます（例: `recipe/`, `auth/`）。`domain/repositories` や `domain/models` の文脈と対応させます
- 1 ユースケース 1 ファイルを基本とします。関連が強い場合は同じサブディレクトリにまとめます
- クラスで書く場合はコンストラクタでリポジトリのインターフェースを受け取り、関数で書く場合は引数でリポジトリ（またはその関数）を受け取るようにし、**具象実装を import しません**

---

## 命名規則

- **ファイル名** … `{操作}-{関心事}-usecase.ts` または `{操作}.usecase.ts`（例: `create-recipe-usecase.ts`, `signup.usecase.ts`, `login.usecase.ts`）
- **関数で書く場合** … `{操作}{関心事}Usecase` または `{操作}Usecase`（例: `createRecipeUsecase`）
- **クラスで書く場合** … `{操作}UseCase`（例: `SignupUseCase`, `LoginUseCase`）。実行メソッドは `execute` に揃えるとよいです

---

## 依存のルール

> 💡 **なぜ usecase は infrastructure を import してはいけないの？**  
> infrastructure（Supabase など）を usecase が直接 import すると、  
> 「DB を変えたら usecase も変える必要が出る」という問題が起きます。  
> usecase は「こういうことができる何か（インターフェース）に頼む」とだけ書いておき、  
> 具体的な実装（Supabase）は app 層から `deps` として渡してもらうことで、  
> usecase が DB の変更の影響を受けなくなります。

### 依存してよいもの

- **`src/domain/repositories/`** … リポジトリの**インターフェースと入出力型**のみ。実装は import せず、呼び出し元（app 層など）から deps として受け取ります（例: `import type { AuthRepository, SignupInput } from '@/domain/repositories/auth-repository'`）
- **`src/domain/models/`** … ドメインモデル（エンティティなど）を参照できます（例: `import type { Recipe } from '@/domain/models/recipe/recipe'`）
- **`src/types/`** … ユースケースの戻り値用の Result 型など（例: `SignupResult`, `LoginResult`）
- **`src/utils/`** … プレーンなバリデーション関数など、副作用のないユーティリティ（例: `isValidEmail`, `isValidPasswordLength`）
- **`src/constants/`** … エラーメッセージなどの定数
- **TypeScript / JavaScript の組み込み** … `Promise`, `Date`, `string`, `number` などはそのまま使えます

### 依存してはいけないもの

- **`@/infrastructure/*`** … リポジトリの**実装**を import しません。インターフェースにだけ依存し、実装は app 層で組み立てて deps として渡します
- **`@/app/*`** … ルーティングや Server Actions は usecase を呼び出す側なので、usecase からは依存しません
- **`@/presentation/*`**, **`@/hooks/*`** … UI に依存しません
- **`@/lib/*`** … Supabase クライアントなどは usecase から直接使いません。リポジトリ経由で永続化します

---

## やってよいこと（詳細）

- **リポジトリのオーケストレーション** … 複数のリポジトリを組み合わせ、順序や並列実行（`Promise.all` など）を決めます
- **入力のバリデーション** … メール形式・パスワード長など、ユースケースの入口でビジネスルールに沿ったチェックを行います
- **成功・失敗の型で返す** … `{ success: true, user }` / `{ success: false, error }` で返し、呼び出し元で分岐しやすくします
- **ドメインモデルや契約の型をそのまま使う** … 入出力は `domain/models` や `domain/repositories` の型を使って表現します

---

## コード例

### クラスで実装するパターン（認証などシンプルなシナリオに向いている）

コンストラクタでリポジトリのインターフェースを受け取ります。  
実装（`AuthRepositoryImpl`）は app 層で生成して渡すので、usecase は import しません。

```ts
// auth/signup.usecase.ts
import type { AuthRepository, SignupInput } from "@/domain/repositories/auth-repository";
import type { SignupResult } from "@/types/auth";
import { isValidEmail, isValidPasswordLength } from "@/utils/validation";
import { ERROR_MESSAGES } from "@/constants/error-messages";

export class SignupUseCase {
  // コンストラクタで「AuthRepository という契約を満たす何か」を受け取る
  constructor(private authRepository: AuthRepository) {}

  async execute(input: SignupInput): Promise<SignupResult> {
    // バリデーションはここで行う
    if (!isValidEmail(input.email)) {
      return { success: false, error: ERROR_MESSAGES.EMAIL_INVALID_FORMAT };
    }
    if (!isValidPasswordLength(input.password, 8)) {
      return { success: false, error: ERROR_MESSAGES.PASSWORD_MIN_LENGTH(8) };
    }
    // 実装の詳細は知らず、「signup できる何か」に委譲するだけ
    const user = await this.authRepository.signup(input);
    return { success: true, user };
  }
}
```

### 関数で実装するパターン（レシピ作成など複数リポジトリを組み合わせるシナリオに向いている）

引数の `deps` に「必要な操作の関数の型」を宣言して受け取ります。  
app 層で具体的な実装関数を `deps` に入れて渡します。

```ts
// recipe/create-recipe-usecase.ts
import type { Recipe } from "@/domain/models/recipe/recipe";
import type { RecipeInput } from "@/domain/repositories/recipe/recipe-repository";

// 「こういうことができる関数を渡してください」という型だけを定義
type CreateRecipeDeps = {
  createRecipe: (input: RecipeInput) => Promise<Recipe>;
  saveIngredients: (recipeId: string, ingredients: RecipeInput["ingredients"]) => Promise<void>;
  saveInstructions: (recipeId: string, instructions: RecipeInput["instructions"]) => Promise<void>;
};

export const createRecipeUsecase = async (
  input: RecipeInput,
  deps: CreateRecipeDeps  // ← 具体的な実装は app 層から渡してもらう
): Promise<Recipe> => {
  const recipe = await deps.createRecipe(input);
  // 材料と手順を並列で保存（Promise.all でまとめて実行）
  await Promise.all([
    deps.saveIngredients(recipe.id, input.ingredients),
    deps.saveInstructions(recipe.id, input.instructions),
  ]);
  return recipe;
};
```

app 層での呼び出し例（実装を deps として渡す）:

```ts
// app 層の例
import { createRecipeUsecase } from "@/usecase/recipe/create-recipe-usecase";
import { createRecipe } from "@/infrastructure/repositories/recipe/recipe-repository-impl";
import { saveIngredients } from "@/infrastructure/repositories/recipe/ingredient-repository-impl";
import { saveInstructions } from "@/infrastructure/repositories/recipe/instruction-repository-impl";

// infrastructure の実装を deps にまとめて usecase に渡す
const recipe = await createRecipeUsecase(input, {
  createRecipe,
  saveIngredients,
  saveInstructions,
});
```

### ❌ NG 例：infrastructure を直接 import する

```ts
// ❌ NG: usecase が infrastructure の実装を直接 import している
import { createRecipe } from "@/infrastructure/repositories/recipe/recipe-repository-impl";
import { saveIngredients } from "@/infrastructure/repositories/recipe/ingredient-repository-impl";

export const createRecipeUsecase = async (input: RecipeInput): Promise<Recipe> => {
  const recipe = await createRecipe(input);      // ← 直接呼んでいる
  await saveIngredients(recipe.id, input.ingredients);
  return recipe;
};
// → Supabase を別の DB に変えたとき、usecase のコードも変える必要が出てしまう
```
