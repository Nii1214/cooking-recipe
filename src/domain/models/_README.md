# `domain/models` について

## 一言でいうと

> **アプリの「言葉の定義集」です。**
>
> このアプリで「レシピ」と言ったら何を指すか、「材料」とは何か——その形（型）を TypeScript で表現する場所です。
> DB でも画面でも、アプリ全体で同じ「言葉」を使えるように、ここで共通の型を定義します。

---

## なぜこの層があるの？

「レシピ」の型がバラバラだったとしたら、こんな問題が起きます。

```ts
// infrastructure が返す型
type Recipe = { thumbnail_url: string; created_at: string }  // snake_case・文字列の日付

// usecase が期待する型
type Recipe = { thumbnailUrl: string; createdAt: Date }       // camelCase・Date オブジェクト
```

それぞれの層で勝手に型を定義すると、変換ロジックが乱立してバグの温床になります。  
また、DB の型（`thumbnail_url` など）をそのままアプリ全体に広めると、
DB を変更したときに全レイヤーの修正が必要になります。

**`domain/models` にアプリ固有の純粋な型を一箇所にまとめることで、
全層が「同じ言語」で話せる共通の基盤になります。**

---

## 概要

- **ドメインモデルの定義** … エンティティ・値オブジェクト・ドメインの型を、ビジネスルールに沿って定義します
- **文脈ごとの整理** … `recipe/`、`auth/` など、関心ごとにサブディレクトリで分けます
- **最内層の純粋な型** … DB・UI・フレームワークに依存しない、「アプリの言葉」だけを表現します

---

## やること・やらないこと（早引き）

| ✅ やってよいこと | ❌ やってはいけないこと |
|-----------------|----------------------|
| TypeScript の型・インターフェースを定義する | DB のカラム名（`thumbnail_url` など snake_case）を型に含める |
| 同ディレクトリ内の型を参照する | Supabase・Next.js などの型を import する |
| JSDoc でフィールドの意味を補足する | `console.log` などの副作用を書く |
| `Date`, `string`, `number` などの組み込み型を使う | DB・外部 API に依存するコードを書く |

---

## 配置方針

- このディレクトリには **型・インターフェース** のみを置きます。ビジネスロジックが複雑な場合、ドメインサービスは `src/domain/` の別ディレクトリを検討してください
- **文脈ごとにサブディレクトリ**で分けます（例: `recipe/recipe.ts`, `recipe/ingredient.ts`）。1 文脈内で相互参照する型は同じサブディレクトリにまとめます
- エンティティの**実装（振る舞い）**は、必要最小限の純粋関数やゲッター程度に留め、インフラ・UI の都合は書きません

---

## 命名規則

- **ファイル名** … 関心事を表す名前（例: `recipe.ts`, `ingredient.ts`, `user.ts`）。サブディレクトリ名は文脈名（例: `recipe/`, `auth/`）
- **型・インターフェース名** … PascalCase（例: `Recipe`, `Ingredient`, `Category`）。エンティティは単数形の名詞が望ましいです

---

## 依存のルール

> 💡 **「依存する」とは何か？**  
> TypeScript では `import` することが「依存する」ことを意味します。  
> `import { X } from '@/lib/...'` と書いたら、そのファイルはライブラリに「依存している」状態です。

`domain/models` はアプリの**最内層**です。ここが外側のライブラリに依存すると、
ライブラリの変更のたびにドメインの型まで変える必要が出てきます。
型だけを見て「このアプリがどんなデータを扱うか」が読める状態を保ちましょう。

### 依存してよいもの

- **同ディレクトリ内の他のファイル** … `import type { Ingredient } from './ingredient'` のように、同じ文脈の型を参照してよいです
- **TypeScript / JavaScript 組み込み** … `Date`, `string`, `number`, `boolean`, `Array`, `Record` などはそのまま使えます

### 依存してはいけないもの（ = import してはいけないもの）

- プロジェクト内の他層すべて: `@/infrastructure/*`, `@/usecase/*`, `@/app/*`, `@/lib/*`, `@/presentation/*`, `@/hooks/*`, `@/utils/*`, `@/types/*`, `@/repositories/*`
- フレームワーク: React, Next.js など
- ランタイムの実装が入るパッケージ: Supabase クライアント、HTTP クライアント、DB ドライバ、日付ライブラリ（dayjs 等）など。日付は `Date` で表現します

---

## コード例

### ✅ よい例：純粋な TypeScript の型で定義する

```ts
// recipe/ingredient.ts
export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  note?: string;
  order: number;
}
```

```ts
// recipe/recipe.ts
import type { Category } from "./category";
import type { Ingredient } from "./ingredient";
import type { Instruction } from "./instruction";

export interface Recipe {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;         // DB の thumbnail_url ではなく、アプリの言葉で書く
  servingCount: number;
  preparationTimeMinutes: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  categories: Category[];
  authorId: string;
  createdAt: Date;               // DB の文字列ではなく Date 型
  updatedAt: Date;
}
```

### ❌ NG 例：DB のカラム名や外部ライブラリの型を使う

```ts
// ❌ NG: DB の snake_case をそのままドメインの型にしている
export interface Recipe {
  id: string;
  thumbnail_url?: string;  // ← DB のカラム名がドメインに漏れている
  created_at: string;      // ← DB の型（文字列）がドメインに漏れている
}
// → DB のテーブル定義を変えると、このファイルも変更が必要になってしまう

// ❌ NG: Supabase の型を直接 import している
import type { Database } from "@/lib/supabase/database.types";
export type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
// → DB のスキーマが変わると型も変わり、アプリ全体に影響する
```
