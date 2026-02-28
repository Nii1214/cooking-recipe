# `src/usecase`について

## 概要
このディレクトリは以下の役割がある。
- **アプリケーション固有のユースケース** … 「レシピを作成する」「ユーザーを登録する」など、アプリの振る舞いを 1 つにまとめたオーケストレーション
- **リポジトリの組み合わせと順序** … どのリポジトリをどの順で呼ぶか、トランザクション的なまとまりをこの層で決める
- **ドメインの契約への依存** … 永続化の「やり方」には依存せず、`domain/repositories` のインターフェース（契約）にだけ依存する。具体的な実装は app 層から注入する

## 配置方針
- **文脈（関心事）ごとにサブディレクトリ**で分ける（例: `recipe/`, `auth/`）。`domain/repositories` や `domain/models` の文脈と対応させる
- 1 ユースケース 1 ファイルを基本とする。関連が強い場合は同じサブディレクトリにまとめる
- クラスで書く場合はコンストラクタでリポジトリのインターフェースを受け取り、関数で書く場合は引数でリポジトリ（またはその関数）を受け取るようにし、**具象実装を import しない**

## 命名規則
- ファイル名: `{操作}-{関心事}-usecase.ts` または `{操作}.usecase.ts`（例: `create-recipe-usecase.ts`, `signup.usecase.ts`, `login.usecase.ts`）
- 関数で書く場合: `{操作}{関心事}Usecase` または `{操作}Usecase`（例: `createRecipeUsecase`）
- クラスで書く場合: `{操作}UseCase`（例: `SignupUseCase`, `LoginUseCase`）。実行メソッドは `execute` に揃えるとよい

## 依存のルール（クリーンアーキテクチャの観点）

ユースケース層は**内側のドメインに依存し、外側のインフラや UI の具象に依存しない**。実務的には次の import ルールで守ります。

### 依存してよいもの
- **`src/domain/repositories/`** … リポジトリの**インターフェースと入出力型**のみ。実装は import せず、呼び出し元（app 層など）から注入する（例: `import type { AuthRepository, SignupInput } from '@/domain/repositories/auth-repository'`）
- **`src/domain/models/`** … ドメインモデル（エンティティなど）を参照してよい（例: `import type { Recipe } from '@/domain/models/recipe/recipe'`）
- **`src/types/`** … ユースケースの戻り値用の Result 型など、アプリ全体で使う型を置いている場合は参照してよい（例: `SignupResult`, `LoginResult`）
- **`src/utils/`** … プレーンなバリデーション関数など、副作用のないユーティリティ（例: `isValidEmail`, `isValidPasswordLength`）
- **`src/constants/`** … エラーメッセージなど、定数のみを参照してよい
- **TypeScript / JavaScript の組み込み** … `Promise`, `Date`, `string`, `number` などはそのまま使用してよい

### 依存してはいけないもの
- **`@/infrastructure/*`** … リポジトリの**実装**を import しない。契約（インターフェース）にだけ依存し、実装は app 層でインスタンス化して渡す（DI）
- **`@/app/*`** … ルーティングや Server Actions は usecase を呼び出す側なので、usecase からは依存しない
- **`@/presentation/*`**, **`@/hooks/*`** … UI に依存しない
- **`@/lib/*`** … Supabase クライアントなどは usecase から直接使わない。リポジトリ経由で永続化する

## やってよいこと
- **リポジトリのオーケストレーション** … 複数のリポジトリを組み合わせ、順序や並列実行（`Promise.all` など）を決める
- **入力のバリデーション** … メール形式・パスワード長など、ユースケースの入口でビジネスルールに沿ったチェックを行う
- **成功・失敗の型で返す** … Result 型（`{ success: true, user }` / `{ success: false, error }`）で返し、呼び出し元で分岐しやすくする
- **ドメインモデルや契約の型をそのまま使う** … 入出力は `domain/models` や `domain/repositories` の型を使って表現する

## やってはいけないこと
- **インフラの実装を import しない** … `import { createRecipe } from '@/infrastructure/repositories/...'` のように具象に依存せず、インターフェース経由で操作する。実装は app 層で注入する
- **DB や API を直接叩かない** … 永続化は必ずリポジトリのインターフェース経由で行う
- **UI の都合を書かない** … 「この画面用」のフォーマットやコンポーネント用の props の組み立ては presentation 層に任せる
- **契約を変えない** … リポジトリのインターフェースやドメインモデルは usecase で定義・変更しない。必要なら domain 層で変更する

## コード例

### クラスでリポジトリを DI するパターン（推奨）

```ts
// auth/signup.usecase.ts
import type { AuthRepository, SignupInput } from "@/domain/repositories/auth-repository";
import type { SignupResult } from "@/types/auth";
import { isValidEmail, isValidPasswordLength } from "@/utils/validation";
import { ERROR_MESSAGES } from "@/constants/error-messages";

export class SignupUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(input: SignupInput): Promise<SignupResult> {
    if (!isValidEmail(input.email)) {
      return { success: false, error: ERROR_MESSAGES.EMAIL_INVALID_FORMAT };
    }
    if (!isValidPasswordLength(input.password, 8)) {
      return { success: false, error: ERROR_MESSAGES.PASSWORD_MIN_LENGTH(8) };
    }
    const user = await this.authRepository.signup(input);
    return { success: true, user };
  }
}
```

### 関数でリポジトリを引数で受け取るパターン

usecase はリポジトリの**インターフェース（型）**にだけ依存し、実装は呼び出し元（app 層）から渡すようにします。

```ts
// recipe/create-recipe-usecase.ts
import type { Recipe } from "@/domain/models/recipe/recipe";
import type { RecipeInput } from "@/domain/repositories/recipe/recipe-repository";

type CreateRecipeDeps = {
  createRecipe: (input: RecipeInput) => Promise<Recipe>;
  saveIngredients: (recipeId: string, ingredients: RecipeInput["ingredients"]) => Promise<void>;
  saveInstructions: (recipeId: string, instructions: RecipeInput["instructions"]) => Promise<void>;
};

export const createRecipeUsecase = async (
  input: RecipeInput,
  deps: CreateRecipeDeps
): Promise<Recipe> => {
  const recipe = await deps.createRecipe(input);
  await Promise.all([
    deps.saveIngredients(recipe.id, input.ingredients),
    deps.saveInstructions(recipe.id, input.instructions),
  ]);
  return recipe;
};
```

app 層での呼び出し例（実装を渡す）:

```ts
// app 層の例
import { createRecipeUsecase } from "@/usecase/recipe/create-recipe-usecase";
import { createRecipe } from "@/infrastructure/repositories/recipe/recipe-repository-impl";
import { saveIngredients } from "@/infrastructure/repositories/recipe/ingredient-repository-impl";
import { saveInstructions } from "@/infrastructure/repositories/recipe/instruction-repository-impl";

const recipe = await createRecipeUsecase(input, {
  createRecipe,
  saveIngredients,
  saveInstructions,
});
```
