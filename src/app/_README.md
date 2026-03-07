# `src/app`について

## 概要
このディレクトリは **Next.js App Router** のルートであり、クリーンアーキテクチャでは**インターフェースアダプタ（外側の層）**に相当する。主な役割は次のとおり。

- **ルーティング** … ファイルベースのルート（`page.tsx`）で URL と画面を対応させる
- **Server Actions** … フォーム送信やボタン操作など、サーバー側で実行する処理の入口。presentation 層から呼ばれる
- **deps の組み立て** … usecase が依存するリポジトリの**実装（infrastructure）**を import し、usecase に deps オブジェクトとして渡す。usecase は「契約（インターフェース）」だけに依存し、app 層が「誰を誰に渡すか」を決める
- **HTTP・フレームワークとの橋渡し** … `FormData` の受け取り、`redirect()`、エラーの整形など、Next.js やインフラの都合を usecase の入出力に変換する

## 配置方針
- **App Router の規約に従う** … `page.tsx`（ページ）、`layout.tsx`（レイアウト）、`loading.tsx`（ローディング）などは Next.js のルールどおり配置する
- **Server Actions** … 同じルート配下に `action.ts` や `*.action.ts` を置き、そのルートで使う Action をまとめる（例: `recipe/new/action.ts`、`(auth)/signup/signup.action.ts`）
- **関心事ごとにディレクトリを分ける** … `recipe/`、`(auth)/` など、機能や文脈ごとにサブディレクトリを切る。`(auth)` はルートグループで URL に含まれない

## 命名規則
- **ページ** … `page.tsx`（Next.js 規約）
- **Server Action ファイル** … `action.ts` または `{操作}.action.ts`（例: `signup.action.ts`、`login.action.ts`）
- **Action 関数** … `{操作}Action`（例: `createRecipeAction`、`signupAction`、`loginAction`）

## 依存のルール（クリーンアーキテクチャの観点）

app 層は**外側の層**なので、内側の usecase や domain、および同じ外側の infrastructure を「呼ぶ」側になる。次の import ルールで整理する。

### 依存してよいもの
- **`src/usecase/`** … ユースケースを呼び出す。リポジトリの実装は app 層で組み立てて usecase に deps として渡す
- **`src/infrastructure/`** … リポジトリの**実装**を import し、usecase に渡すために使う。また、エラーメッセージの整形（例: `getAuthErrorMessage`）など、インフラ寄りのユーティリティを利用してよい
- **`src/domain/`** … 型（`RecipeInput`、`CreateRecipeInput` など）を参照してよい。Action の入出力を domain の型で揃える
- **`src/lib/`** … Supabase のサーバー用クライアント（`createAuthedClient`）など、フレームワーク・外部サービスのラッパー
- **`src/types/`** … Result 型など、Action の戻り値用の型（例: `SignupResult`、`LoginResult`）
- **`src/utils/`** … `isRedirectError` など、プレーンなユーティリティ
- **`src/constants/`** … 定数を参照してよい
- **Next.js** … `redirect`、`next/navigation`、`"use server"` など

### 依存してはいけないもの
- **`src/presentation/`** … app が presentation から「呼ばれる」側なので、app から presentation を import しない（ページでコンポーネントを使うのは Next.js の構成上問題ないが、Action 内で presentation を import する必要はない）
- **domain の「実装」** … domain には実装はなくインターフェースと型だけなので、実質的には「domain を直接実装する」ようなコードを app に書かない、という意味。リポジトリの実装は infrastructure にあり、app はそれを usecase に渡すだけ

## やってよいこと
- **usecase の呼び出し** … Action 内で usecase を実行する。その前に、リポジトリの実装（infrastructure）を組み立てて usecase に deps オブジェクトで渡す
- **FormData のパース** … `formData.get('email')` などを Action の入口で行い、usecase 用の入力オブジェクトに変換する
- **リダイレクト** … usecase の結果に応じて `redirect('/signup/verify-email')` や `redirect('/top')` を呼ぶ
- **エラーの整形** … インフラや usecase から返ったエラーを、画面に返す用のメッセージに変換する（例: `getAuthErrorMessage(error)`）
- **サーバー側で付与する値** … `authorId`、`id`、`createdAt`、`updatedAt` など、クライアントに任せない値を Action で付与してから usecase に渡す

## やってはいけないこと
- **ビジネスロジックを書かない** … バリデーションや「どのリポジトリをどの順で呼ぶか」は usecase に任せる。app は「入力を渡す」「結果を返す・リダイレクトする」に留める
- **usecase を飛ばして infrastructure を直接呼ばない** … 永続化や認証のオーケストレーションは usecase 経由で行い、Action から直接 `createRecipe` などを並べて呼ばない（usecase に deps で渡した上で usecase を呼ぶ形にする）
- **presentation 用の props の細かい組み立て** … 画面用のフォーマットやコンポーネント用の加工は presentation 層に任せる

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
    const { user } = await createAuthedClient();
    const now = new Date();
    const recipeInput: RecipeInput = {
      ...input,
      id: crypto.randomUUID(),
      authorId: user.id,
      createdAt: now,
      updatedAt: now,
    };

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

## 参照
- クリーンアーキテクチャとディレクトリの対応: `docs/architect/clean-architecture-and-directory.md`
- ユースケース層のルール: `src/usecase/_README.md`
