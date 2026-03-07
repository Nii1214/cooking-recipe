# テーブル名: recipe_ingredients

## 概要

レシピの材料を管理するテーブル。
1つのレシピに複数の材料が紐づく（1対多）。
表示順を `order_position` で管理する。

## ドメインモデルとの対応

`src/domain/models/recipe/ingredient.ts` の `Ingredient` インターフェース

| ドメインモデルのフィールド | テーブルのカラム | 変換内容 |
|---|---|---|
| `id` | `id` | そのまま |
| `name` | `name` | そのまま |
| `quantity` | `quantity` | そのまま |
| `unit` | `unit` | そのまま |
| `note` | `note` | そのまま |
| `order` | `order_position` | `order` は SQL 予約語のため `order_position` に変更 |
| ※なし | `recipe_id` | DB 側の外部キー（ドメインモデルには含まない） |

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | 主キー |
| `recipe_id` | `uuid` | NOT NULL | - | 所属するレシピ（`recipes.id` を参照） |
| `name` | `text` | NOT NULL | - | 材料名（例: 人参） |
| `quantity` | `text` | NOT NULL | - | 量（例: 1.5、適量） |
| `unit` | `text` | NOT NULL | - | 単位（例: 本、g、小さじ1） |
| `note` | `text` | NULL 許容 | - | 補足メモ（例: 乱切りにしておく） |
| `order_position` | `integer` | NOT NULL | - | 表示順（1始まり） |
| `created_at` | `timestamptz` | NOT NULL | `now()` | 作成日時 |

## 制約・インデックス

- `id` — PRIMARY KEY
- `recipe_id` — FOREIGN KEY → `recipes(id)` `ON DELETE CASCADE`（レシピ削除時に自動削除）
- `order_position` — CHECK: `order_position > 0`
- インデックス: `(recipe_id, order_position)`（レシピの材料一覧を順番通りに取得するため）

## RLS ポリシー

親テーブルである `recipes` の `is_draft` と家族メンバーの 2 軸で制御する。
`recipes` テーブルへのサブクエリを使い、常に親レシピの状態を参照して判定する。

| 操作 | 条件 | 説明 |
|---|---|---|
| SELECT | 親レシピの `author_id = auth.uid()` | 自分のレシピの材料は常に見える（下書き含む） |
| SELECT | 親レシピの `is_draft = false` かつ 同じ家族のメンバー | 家族の公開済みレシピの材料は見える |
| INSERT | 親レシピの `author_id = auth.uid()` | 自分のレシピにのみ材料を追加できる |
| UPDATE | 親レシピの `author_id = auth.uid()` | 自分のレシピの材料は常に更新できる（下書き含む） |
| UPDATE | 親レシピの `is_draft = false` かつ 同じ家族のメンバー | 家族の公開済みレシピの材料を更新できる |
| DELETE | 親レシピの `author_id = auth.uid()` | 自分のレシピの材料は常に削除できる（下書き含む） |
| DELETE | 親レシピの `is_draft = false` かつ 同じ家族のメンバー | 家族の公開済みレシピの材料を削除できる |

## 備考

- `order` は PostgreSQL の予約語（`ORDER BY` など）と衝突するため、カラム名は `order_position` とする
- `quantity` を `text` にしているのは「適量」「少々」などの文字列も入力できるようにするため
- RLS は `recipes` テーブルへのサブクエリで `is_draft` と `author_id` を参照する。家族判定のサブクエリは [`../family/family_members.md`](../family/family_members.md) を参照
