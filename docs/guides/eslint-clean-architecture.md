# ESLint とクリーンアーキテクチャ（import 制限）

## 概要

本プロジェクトでは、ESLint の **`no-restricted-imports`** ルールで、クリーンアーキテクチャの**依存の向き**を守れていない import を検知します。

- **domain / usecase** の違反は **error**（CI で失敗）
- **infrastructure / presentation** の違反は **warn**（警告のみ）

「内側の層は外側の層を import してはいけない」というルールに反する import を書くと、該当層に応じてエラーまたは警告が表示されます。

---

## 対象ディレクトリと禁止 import

| 層 | 対象パス | 依存してはいけないパス | 厳格さ |
|----|----------|------------------------|--------|
| **domain** | `src/domain/**` | `@/app`, `@/presentation`, `@/usecase`, `@/infrastructure`, `@/lib`, **`@/types`, `@/utils`, `@/constants`** | **error** |
| **usecase** | `src/usecase/**` | `@/app`, `@/presentation`, `@/infrastructure`, `@/lib` | **error** |
| **infrastructure** | `src/infrastructure/**` | `@/app`, `@/presentation`, `@/usecase` | warn |
| **presentation** | `src/presentation/**` | `@/usecase`, `@/infrastructure`, `@/lib` | warn |

- **domain** は **types / utils / constants にも依存しません**。ドメインは「型・インターフェース・契約」のみで自己完結させ、フレームワークやアプリ固有のユーティリティに依存しない設計にしています。
- **usecase** は domain と types / utils / constants のみ依存可。infrastructure は deps で受け取ります。
- **app** 層（`src/app/**`）には import 制限を設けていません。app は usecase / infrastructure / lib / presentation 等を組み立てる**オーケストレーター**のため、必要なものを import してよい想定です。厳密に縛る場合はドキュメントとレビューで補完してください（後述「指摘への対応と限界」参照）。
- **presentation から domain** は **許可**しています。`Recipe` や `Ingredient` などの**型**を props の型注釈に使うために `import type` するのは問題ありません。

---

## shared（types / utils / constants / lib）の設計

| パス | 役割 | 依存してよい層 |
|------|------|----------------|
| **types/** | アプリ全体で使う型（Result 型など） | usecase, app, presentation, infrastructure（必要に応じて） |
| **utils/** | プレーンなユーティリティ（バリデーション等） | usecase, app, presentation |
| **constants/** | 定数（エラーメッセージ等） | usecase, app, presentation |
| **lib/** | 外部クライアントのラッパー（Supabase 等） | **app, infrastructure のみ**。usecase / presentation / domain は import 禁止 |

domain は上記のいずれにも依存しません。usecase は types / utils / constants のみ可で、lib は不可です。

---

## 警告になる例・ならない例

### usecase から infrastructure を import した場合（エラー）

```ts
// src/usecase/recipe/create-recipe-usecase.ts
import { createRecipe } from "@/infrastructure/repositories/recipe/recipe-repository-impl"; // ← エラー（domain/usecase は error）
```

**メッセージ例:**  
`usecase は infrastructure に依存できません。実装は deps で受け取ってください（クリーンアーキテクチャ）`

**正しいやり方:**  
usecase はリポジトリの**インターフェース（型）**だけを import し、実装は app 層で deps として渡す。

```ts
import type { RecipeInput } from "@/domain/repositories/recipe/recipe-repository";
// 実装は import せず、呼び出し元から deps で受け取る
```

---

### presentation から usecase を import した場合（警告）

```ts
// src/presentation/components/recipe/RecipeCreateForm.tsx
import { createRecipeUsecase } from "@/usecase/recipe/create-recipe-usecase"; // ← 警告
```

**メッセージ例:**  
`presentation は usecase を直接 import できません。Server Action（app）を呼び、app 層で usecase を実行してください（クリーンアーキテクチャ）`

**このプロジェクトでの流れ:**  
「presentation が usecase を呼ぶ」のではなく、**presentation は Server Action（app 層）を呼び、その Action が usecase を呼ぶ**形にしています。  
コンポーネントは `createRecipeAction`（`@/app/recipe/new/action`）を呼び、Action 内で `createRecipeUsecase` を実行するため、presentation から usecase を import する必要はありません。

**正しいやり方:**  
presentation では Server Action を import して呼び出す。

```ts
import { createRecipeAction } from "@/app/recipe/new/action";
// フォーム送信時に createRecipeAction(formData) を呼ぶ
```

---

### presentation から domain の型を使う場合（許可）

```ts
// src/presentation/components/recipe/RecipeCard.tsx
import type { Recipe } from "@/domain/models/recipe/recipe"; // ← OK（型のみ）

type Props = { recipe: Recipe };
export function RecipeCard({ recipe }: Props) { ... }
```

**方針:**  
presentation から **domain の型（`import type`）** を import して、props の型注釈に使うのは**許可**しています。  
同じ型を `types/` に重複定義しなくてよいため、運用しやすくなります。  
ドメインの**ロジック**や**リポジトリ**を presentation から呼ぶのは禁止です（app 経由で行う）。

---

### domain から lib を import した場合（エラー）

```ts
// src/domain/models/recipe/recipe.ts
import { createClient } from "@/lib/supabase/client"; // ← エラー
```

**同様に、domain から types / utils / constants を import した場合もエラーになります。** ドメインは他層・shared に依存せず自己完結させてください。

**メッセージ例:**  
`domain は lib に依存できません（クリーンアーキテクチャ）`

**正しいやり方:**  
domain は型・インターフェースのみ。Supabase などのクライアントは infrastructure や app で利用する。

---

## 注意・改善ポイント

以下の点は現状のルールや ESLint の限界として認識し、必要に応じて運用で補うとよいです。

### Read 系の柔軟性（presentation → usecase）

サジェストや検索候補など、**Read 専用の usecase** を presentation から直接呼びたい場合、現状のルールでは警告が出ます。

**取りうる対応:**

1. **Server Action / app 経由のままにする**  
   サジェスト用の API や Server Action を app に用意し、presentation はそこだけを呼ぶ。use case は app 内で実行する。
2. **eslint-disable で一時的に許可する**  
   どうしても presentation から Read 用 usecase を呼ぶ設計にする場合、該当行の直前にコメントを書いて意図を残す。

   ```ts
   // サジェスト用の Read 専用 usecase のため、presentation から直接呼ぶ（設計上許容）
   // eslint-disable-next-line no-restricted-imports -- Read 系 usecase に限り許可
   import { searchIngredientUsecase } from "@/usecase/read/search-ingredient-usecase";
   ```

3. **Read 用 usecase をディレクトリで分ける**  
   `usecase/read/**` のように分け、将来的に「presentation からは `@/usecase/read/*` のみ許可」するルールを別途検討する（現状の no-restricted-imports では「サブパスだけ許可」が難しいため、ルール変更か suppress の運用になる）。

---

### deps 経由の強制

「action が usecase に deps を渡しているか」は **ESLint では検証できません**。  
import の有無だけでは「正しく deps を組み立てて渡しているか」まで分からないため、**ドキュメント（`usecase/_README.md` など）とコードレビュー**で補完してください。

---

### 対象ファイルの拡張子

ルールの `files` には **`.ts` / `.tsx`** に加え、**`.js` / `.jsx` / `.mjs`** も含めています。  
JavaScript のみのファイルを `src/` 以下に追加した場合も、同じ import 制限がかかります。

---

### patterns の `@/app` と `@/app/*` について

各 pattern で `@/app` と `@/app/*` の両方を指定しています。  
- `@/app` … `import x from '@/app'` のような**パスそのもの**への import を検知  
- `@/app/*` … `import x from '@/app/recipe/action'` のような**サブパス**への import を検知  

ESLint の pattern では `*` が「1 文字以上」にマッチするため、両方指定しておくと漏れがありません。ルールが冗長に見えても、意図的にこの形にしています。

---

## 設定の場所

- **ESLint の設定:** `eslint.config.mjs`。禁止パスは `FORBIDDEN` オブジェクトで一元定義し、層ごとに `restrictedImportRule()` で適用しています（重複削減・保守性向上）。
- **依存関係の図・詳細:** `docs/architect/clean-architecture-and-directory.md` の「2.2 依存関係の図」

---

## 指摘への対応と限界（Clean Architecture enforcement）

「小規模なら OK、enforcement としては中級」という指摘を踏まえ、以下を反映済みです。

| 指摘 | 対応 |
|------|------|
| **warn で弱い** | domain と usecase を **error** に変更。違反すると CI で失敗する。 |
| **domain の防御が甘い** | domain から **types / utils / constants** の import を禁止。ドメインは他層・shared に依存しない形に強化。 |
| **shared/lib の設計が曖昧** | 上記「shared の設計」表で、types / utils / constants / lib の役割と「誰が依存してよいか」を明文化。 |
| **app 層が無制限** | ルールでは制限していない（app はオーケストレーターのため）。**ドキュメントとレビュー**で「app は usecase / infrastructure / lib / presentation / types および domain（型のみ）に限定」と補完。 |
| **config 重複で保守性低い** | 禁止パスを `FORBIDDEN` に集約し、`pathGroup()` / `restrictedImportRule()` で共通化。変更は 1 か所で済むようにした。 |
| **transitive dependency 防げない** | **ESLint の no-restricted-imports では検知できない**。A → B → C の「A が C に間接依存」は防げない。必要なら dependency-cruiser 等のツール導入を検討。 |

---

## 厳格さの変更（error / warn）

- **domain / usecase** は現在 **error**。緩めたい場合は `eslint.config.mjs` の `restrictedImportRule(FORBIDDEN.domain, "error")` の第 2 引数を `"warn"` に変更する。
- **infrastructure / presentation** は **warn**。厳しくする場合は同様に `"error"` に変更する。

---

## 関連ドキュメント

- [クリーンアーキテクチャとディレクトリ構成](../architect/clean-architecture-and-directory.md)
- [usecase 層のルール](../../src/usecase/_README.md)
