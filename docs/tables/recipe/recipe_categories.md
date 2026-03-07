# テーブル名: recipe_categories

## 概要

レシピとカテゴリの多対多の関係を管理する中間テーブル。
1つのレシピに複数のカテゴリを紐付けられる。

## ドメインモデルとの対応

`Recipe.categories: Category[]` の関係を表す。
中間テーブル自体に対応するドメインモデルは持たない。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `recipe_id` | `uuid` | NOT NULL | - | レシピの ID（`recipes.id` を参照） |
| `category_id` | `uuid` | NOT NULL | - | カテゴリの ID（`categories.id` を参照） |
| `created_at` | `timestamptz` | NOT NULL | `now()` | 作成日時 |

## 制約・インデックス

- PRIMARY KEY: `(recipe_id, category_id)` の複合主キー（同じ組み合わせの重複を防ぐ）
- `recipe_id` — FOREIGN KEY → `recipes(id)` `ON DELETE CASCADE`（レシピ削除時に自動削除）
- `category_id` — FOREIGN KEY → `categories(id)` `ON DELETE CASCADE`（カテゴリ削除時に自動削除）
- インデックス: `category_id`（カテゴリ別レシピ一覧取得で使用）

## RLS ポリシー

親テーブルである `recipes` の `is_draft` と家族メンバーの 2 軸で制御する。
`recipes` テーブルへのサブクエリを使い、常に親レシピの状態を参照して判定する。

| 操作 | 条件 | 説明 |
|---|---|---|
| SELECT | 親レシピの `author_id = auth.uid()` | 自分のレシピのカテゴリ紐付けは常に見える（下書き含む） |
| SELECT | 親レシピの `is_draft = false` かつ 同じ家族のメンバー | 家族の公開済みレシピのカテゴリ紐付けは見える |
| INSERT | 親レシピの `author_id = auth.uid()` | 自分のレシピにのみカテゴリを紐付けできる |
| DELETE | 親レシピの `author_id = auth.uid()` | 自分のレシピのカテゴリ紐付けは常に削除できる（下書き含む） |
| DELETE | 親レシピの `is_draft = false` かつ 同じ家族のメンバー | 家族の公開済みレシピのカテゴリ紐付けを削除できる |

## 備考

- 中間テーブルのため `id` カラムは持たず、`(recipe_id, category_id)` を複合主キーとする
- UPDATE は想定しない（削除して再作成するパターン）
- RLS は `recipes` テーブルへのサブクエリで `is_draft` と `author_id` を参照する。家族判定のサブクエリは [`../family/family_members.md`](../family/family_members.md) を参照
