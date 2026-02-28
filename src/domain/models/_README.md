# `domain/models`について

## 概要
このディレクトリは以下の役割がある。
- **ドメインモデルの定義** … エンティティ・値オブジェクト・ドメインの型を、ビジネスルールに沿って定義する
- **文脈（境界づけられたコンテキスト）の表現** … ドメイン駆動設計における**区切られた文脈**に準拠してサブディレクトリで配置する（例: `recipe/`, `auth/`）
- **最内層の純粋な型** … 永続化・UI・フレームワークに依存しない「ドメインの言葉」だけを表現する

## 配置方針
- このディレクトリには **型・インターフェース・値オブジェクト** のみを置く。ビジネスロジックが複雑な場合はドメインサービスは `src/domain/` の別ディレクトリを検討する
- **文脈ごとにサブディレクトリ**で分ける（例: `recipe/recipe.ts`, `recipe/ingredient.ts`）。1文脈内で相互参照する型は同じサブディレクトリにまとめる
- エンティティや値オブジェクトの**実装（振る舞い）**は、必要最小限の純粋関数やゲッター程度に留め、インフラ・UI の都合は書かない

## 命名規則
- ファイル名: 関心事を表す名前（例: `recipe.ts`, `ingredient.ts`, `user.ts`）。サブディレクトリ名は文脈名（例: `recipe/`, `auth/`）
- 型・インターフェース名:  PascalCase（例: `Recipe`, `Ingredient`, `Category`）。エンティティは単数形の名詞が望ましい

## 依存のルール（クリーンアーキテクチャの観点）

ドメイン層は最内層のため、**外側の層やフレームワークに依存してはいけません**。  
TypeScript/JavaScript では「依存する」＝「import する」なので、実務的には次の import ルールで守ります。

### 依存してよいもの
- **このディレクトリ（`src/domain/models/`）内の他のファイル**  
  例: 同じ文脈内の型を参照する `import type { Ingredient } from './ingredient'` や、別文脈の型を参照する `import type { User } from '@/domain/models/auth/user'`
- **TypeScript / JavaScript の組み込み**  
  `Date`, `string`, `number`, `boolean`, `Array`, `Record` などは import 不要でそのまま使用してよい

### 依存してはいけないもの
- **プロジェクト内の他層**
  - `@/infrastructure/*`
  - `@/usecase/*`
  - `@/app/*`
  - `@/lib/*`
  - `@/presentation/*`
  - `@/hooks/*`
  - `@/utils/*`
  - `@/types/*`
  - `@/repositories/*`
- **フレームワーク**  
  React, Next.js など
- **ランタイムの実装が入るパッケージ**  
  Supabase クライアント、HTTP クライアント、DB ドライバ、日付ライブラリ（dayjs 等）など。日付は `Date` で表現する

## やってよいこと
- **プレーンな型・インターフェースの定義** … エンティティ、値オブジェクト、ドメインで使う型を export する
- **同一文脈内の型の参照** … 例: `Recipe` が `Ingredient[]` や `Category[]` を持つように、ドメインの関係性を型で表現する
- **JSDoc による説明** … フィールドの意味や例をコメントで補足してよい

## やってはいけないこと
- **実装を書かない** … DB アクセス・API 呼び出し・ファイル I/O・`console.log` など、副作用やインフラに依存するコードは書かない
- **フレームワーク・ライブラリ固有の型を使わない** …  Next.js の型、Supabase の型、ORM の型などを import して使わない。プレーンな TypeScript の型だけを使う
- **永続化の都合を型に漏らさない** … テーブル名・カラム名・外部キー名などはモデルに書かず、インフラ層のマッピングで吸収する
- **UI の都合を型に漏らさない** … 表示用のフォーマット（例: 日付の文字列形式）やコンポーネント用の props はドメインモデルに含めない

## コード例

文脈 `recipe` 内のエンティティと値オブジェクトの例です。型のみで、同一文脈内の型を参照しています。

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
  thumbnailUrl?: string;
  servingCount: number;
  preparationTimeMinutes: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  categories: Category[];
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

