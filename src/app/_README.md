# `src/app` について

## 一言でいうと

> **ユーザーのリクエストを受け取り、usecase に「よろしく」と渡す玄関口です。**
>
> ページの表示、フォーム送信の受け取り、認証チェック——これらの入口をここで担います。  
> また、「どのリポジトリの実装を使うか」を決めて usecase に渡す（deps の組み立て）のも、この層の重要な役割です。

---

## なぜこの層があるの？

usecase は「機能のシナリオ」を持っていますが、HTTP リクエストを受け取る方法も、フォームデータをパースする方法も知りません。  
app 層が「Next.js の世界」と「ビジネスロジックの世界（usecase）」をつなぐ橋渡しをします。

具体的には、次のことをこの層でやります：

1. **FormData のパース** … `formData.get('email')` などを行い、usecase に渡せる形に変換する
2. **deps の組み立て** … どのリポジトリ実装（`AuthRepositoryImpl` や `createRecipe` 関数）を使うかを決めて、usecase に渡す
3. **リダイレクト** … usecase の結果に応じて `redirect('/top')` などを呼ぶ
4. **エラーの整形** … usecase や infrastructure から返ったエラーを画面用のメッセージに変換する

> 💡 **「deps の組み立て」って何？**  
> usecase は「こういう操作ができる何かを渡してください」という型（インターフェース）しか知りません。  
> app 層で「それは Supabase を使うこの関数です」と具体的な実装を用意して渡します。  
> これにより、usecase は実装の詳細を知らずに済みます。

---

## 概要

- **ルーティング** … ファイルベースのルート（`page.tsx`）で URL と画面を対応させます
- **Server Actions** … フォーム送信やボタン操作など、サーバー側で実行する処理の入口です。presentation 層から呼ばれます
- **deps の組み立て** … usecase が依存するリポジトリの**実装（infrastructure）**を import し、usecase に deps オブジェクトとして渡します。usecase は「契約（インターフェース）」だけに依存し、app 層が「誰を誰に渡すか」を決めます
- **HTTP・フレームワークとの橋渡し** … `FormData` の受け取り、`redirect()`、エラーの整形など、Next.js やインフラの都合を usecase の入出力に変換します

---

## やること・やらないこと（早引き）

| ✅ やってよいこと | ❌ やってはいけないこと |
|-----------------|----------------------|
| usecase を呼び出す | ビジネスロジック（バリデーションなど）をここに書く |
| deps（リポジトリ実装）を組み立てて usecase に渡す | usecase を飛ばして infrastructure を直接 CRUD する |
| FormData をパースして usecase 用の型に変換する | `@/presentation/*` を Action ファイルから import する |
| `redirect()` を呼んで画面遷移させる | 複雑な画面表示のロジックをここに書く |
| `authorId` や `id` などサーバーで付与する値を組み立てる | — |

---

## 配置方針

- **App Router の規約に従います** … `page.tsx`（ページ）、`layout.tsx`（レイアウト）、`loading.tsx`（ローディング）などは Next.js のルールどおり配置します
- **Server Actions** … 同じルート配下に `action.ts` や `*.action.ts` を置き、そのルートで使う Action をまとめます（例: `recipe/new/action.ts`、`(auth)/signup/signup.action.ts`）
- **関心事ごとにディレクトリを分けます** … `recipe/`、`(auth)/` など、機能や文脈ごとにサブディレクトリを切ります。`(auth)` はルートグループで URL に含まれません

---

## 命名規則

- **ページ** … `page.tsx`（Next.js 規約）
- **Server Action ファイル** … `action.ts` または `{操作}.action.ts`（例: `signup.action.ts`、`login.action.ts`）
- **Action 関数** … `{操作}Action`（例: `createRecipeAction`、`signupAction`、`loginAction`）

---

## 依存のルール

app 層は**外側の層**なので、内側の usecase や domain、および同じ外側の infrastructure を「呼ぶ」側になります。

### 依存してよいもの

- **`src/usecase/`** … ユースケースを呼び出します。リポジトリの実装は app 層で組み立てて usecase に deps として渡します
- **`src/infrastructure/`** … リポジトリの**実装**を import し、usecase に渡すために使います。また、エラーメッセージの整形（例: `getAuthErrorMessage`）など、インフラ寄りのユーティリティを利用してよいです
- **`src/domain/`** … 型（`RecipeInput`、`CreateRecipeInput` など）を参照してよいです。Action の入出力を domain の型で揃えます
- **`src/lib/`** … Supabase のサーバー用クライアント（`createAuthedClient`）など、フレームワーク・外部サービスのラッパー
- **`src/types/`** … Result 型など、Action の戻り値用の型（例: `SignupResult`、`LoginResult`）
- **`src/utils/`** … `isRedirectError` など、プレーンなユーティリティ
- **`src/constants/`** … 定数を参照してよいです
- **Next.js** … `redirect`、`next/navigation`、`"use server"` など

### 依存してはいけないもの

- **`src/presentation/`** … Action ファイルから presentation を import しません。page.tsx でコンポーネントを利用するのは Next.js の構成上許容します
- **domain の「実装」** … domain には実装はなくインターフェースと型だけなので、実質的には「リポジトリの実装を app に直接書かない」ということです。実装は infrastructure にあり、app はそれを usecase に渡すだけにします

---

## コード例

### Server Action で usecase に deps を渡すパターン（レシピ作成）

```ts
// recipe/new/action.ts
"use server";

import type { CreateRecipeInput, CreateRecipeResult, RecipeInput } from "@/domain/repositories/recipe/recipe-repository";
import { createRecipe } from "@/infrastructure/repositories/recipe/recipe-repository-impl";
import { saveIngredients } from "@/infrastructure/repositories/recipe/ingredient-repository-impl";
import { saveInstructions } from "@/infrastructure/repositories/recipe/instruction-repository-impl";
import { createRecipeUsecase } from "@/usecase/recipe/create-recipe-usecase";
import { createAuthedClient } from "@/lib/supabase/server";

export async function createRecipeAction(
  input: CreateRecipeInput
): Promise<CreateRecipeResult> {
  try {
    // サーバー側で付与する値をここで組み立てる
    const { user } = await createAuthedClient();
    const now = new Date();
    const recipeInput: RecipeInput = {
      ...input,
      id: crypto.randomUUID(),
      authorId: user.id,
      createdAt: now,
      updatedAt: now,
    };

    // 具体的な実装を deps にまとめて usecase に渡す
    const deps = {
      createRecipe,
      saveIngredients,
      saveInstructions,
    };

    const recipe = await createRecipeUsecase(recipeInput, deps);
    return { success: true, recipe };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "レシピの登録に失敗しました";
    return { success: false, error: message };
  }
}
```

### ページで presentation コンポーネントを使う

```tsx
// recipe/new/page.tsx
import { RecipeCreateForm } from "@/presentation/components/recipe/RecipeCreateForm";

export default function Page() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">レシピ登録</h1>
        <p className="text-sm text-gray-600">家族で共有・継承できるレシピを作成します</p>
      </div>
      <div className="w-full max-w-3xl mx-auto px-4 pb-12">
        <RecipeCreateForm />
      </div>
    </div>
  );
}
```

### ❌ NG 例：ビジネスロジックを Action に直接書く

```ts
// ❌ NG: usecase を使わず、Action にビジネスロジックを書いている
export async function createRecipeAction(input: CreateRecipeInput) {
  const { user } = await createAuthedClient();

  // バリデーションをここに書いている → usecase に書くべき
  if (!input.title || input.title.length < 1) {
    return { success: false, error: "タイトルは必須です" };
  }

  // 複数の insert を Action に直接並べている → usecase に書くべき
  const { data: recipe } = await supabase.from("recipes").insert(...);
  await supabase.from("ingredients").insert(...);
  await supabase.from("instructions").insert(...);

  return { success: true, recipe };
}
// → 同じロジックを別の画面でも使いたいとき、コードのコピペが必要になってしまう
```

---

## 参照

- クリーンアーキテクチャとディレクトリの対応: `docs/architect/clean-architecture-and-directory.md`
- ユースケース層のルール: `src/usecase/_README.md`
