# テーブル名: recipe_instructions

## 概要

レシピの調理手順を管理するテーブル。
1つのレシピに複数の手順が紐づく（1対多）。
各手順には補足画像を任意で添付できる。

## ドメインモデルとの対応

`src/domain/models/recipe/instruction.ts` の `Instruction` インターフェース

| ドメインモデルのフィールド | テーブルのカラム | 変換内容 |
|---|---|---|
| `stepNumber` | `step_number` | camelCase → snake_case |
| `description` | `description` | そのまま |
| `imageUrl` | `image_url` | camelCase → snake_case |
| ※なし | `id` | DB 側で管理（ドメインモデルには含まない） |
| ※なし | `recipe_id` | DB 側の外部キー（ドメインモデルには含まない） |

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | 主キー |
| `recipe_id` | `uuid` | NOT NULL | - | 所属するレシピ（`recipes.id` を参照） |
| `step_number` | `integer` | NOT NULL | - | 手順番号（1始まり） |
| `description` | `text` | NOT NULL | - | 手順の説明文 |
| `image_url` | `text` | NULL 許容 | - | 手順の補足画像 URL（Supabase Storage のパス） |
| `created_at` | `timestamptz` | NOT NULL | `now()` | 作成日時 |

## 制約・インデックス

- `id` — PRIMARY KEY
- `recipe_id` — FOREIGN KEY → `recipes(id)` `ON DELETE CASCADE`（レシピ削除時に自動削除）
- `(recipe_id, step_number)` — UNIQUE（同一レシピで手順番号の重複を禁止）
- `step_number` — CHECK: `step_number > 0`
- インデックス: `(recipe_id, step_number)`（レシピの手順一覧を順番通りに取得するため。UNIQUE 制約により自動作成）

## RLS ポリシー

親テーブルである `recipes` の `is_draft` と家族メンバーの 2 軸で制御する。
`recipes` テーブルへのサブクエリを使い、常に親レシピの状態を参照して判定する。

| 操作 | 条件 | 説明 |
|---|---|---|
| SELECT | 親レシピの `author_id = auth.uid()` | 自分のレシピの手順は常に見える（下書き含む） |
| SELECT | 親レシピの `is_draft = false` かつ 同じ家族のメンバー | 家族の公開済みレシピの手順は見える |
| INSERT | 親レシピの `author_id = auth.uid()` | 自分のレシピにのみ手順を追加できる |
| UPDATE | 親レシピの `author_id = auth.uid()` | 自分のレシピの手順は常に更新できる（下書き含む） |
| UPDATE | 親レシピの `is_draft = false` かつ 同じ家族のメンバー | 家族の公開済みレシピの手順を更新できる |
| DELETE | 親レシピの `author_id = auth.uid()` | 自分のレシピの手順は常に削除できる（下書き含む） |
| DELETE | 親レシピの `is_draft = false` かつ 同じ家族のメンバー | 家族の公開済みレシピの手順を削除できる |

## 備考

- `(recipe_id, step_number)` に UNIQUE 制約を設けることで、同じレシピ内で手順番号の重複を DB レベルで防ぐ
- 手順画像の実体は Supabase Storage に保存し、このカラムには取得用の URL のみ格納する
- `id` カラムは `Instruction` ドメインモデルには現在含まれていないが、DB 側での更新・削除を行う際に必要なため追加する
- RLS は `recipes` テーブルへのサブクエリで `is_draft` と `author_id` を参照する。家族判定のサブクエリは [`../family/family_members.md`](../family/family_members.md) を参照
