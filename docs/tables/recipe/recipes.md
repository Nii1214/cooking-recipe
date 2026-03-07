# テーブル名: recipes

## 概要

レシピの基本情報を管理するテーブル。
タイトル・説明・サムネイル・人数・調理時間など、レシピそのものを表すメインテーブル。

## ドメインモデルとの対応

`src/domain/models/recipe/recipe.ts` の `Recipe` インターフェース

| ドメインモデルのフィールド | テーブルのカラム | 変換内容 |
|---|---|---|
| `id` | `id` | そのまま |
| `title` | `title` | そのまま |
| `description` | `description` | そのまま |
| `thumbnailUrl` | `thumbnail_url` | camelCase → snake_case |
| `servingCount` | `serving_count` | camelCase → snake_case |
| `preparationTimeMinutes` | `preparation_time_minutes` | camelCase → snake_case |
| `isDraft` | `is_draft` | camelCase → snake_case |
| `authorId` | `author_id` | camelCase → snake_case |
| `createdAt` | `created_at` | camelCase → snake_case / `Date` ↔ `timestamptz` |
| `updatedAt` | `updated_at` | camelCase → snake_case / `Date` ↔ `timestamptz` |
| `ingredients` | ※ `recipe_ingredients` テーブルで管理 | - |
| `instructions` | ※ `recipe_instructions` テーブルで管理 | - |
| `categories` | ※ `recipe_categories`（中間テーブル）で管理 | - |

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | 主キー |
| `title` | `text` | NOT NULL | - | レシピタイトル |
| `description` | `text` | NULL 許容 | - | レシピの説明・コメント |
| `thumbnail_url` | `text` | NULL 許容 | - | サムネイル画像の URL（Supabase Storage のパス）|
| `serving_count` | `integer` | NOT NULL | - | 何人前か |
| `preparation_time_minutes` | `integer` | NOT NULL | - | 調理時間（分） |
| `is_draft` | `boolean` | NOT NULL | `true` | 一時保存フラグ。`true` の間は作成者のみ操作可 |
| `author_id` | `uuid` | NOT NULL | - | 作成者（`auth.users.id` を参照） |
| `created_at` | `timestamptz` | NOT NULL | `now()` | 作成日時 |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | 更新日時（トリガーで自動更新） |

## 制約・インデックス

- `id` — PRIMARY KEY
- `author_id` — FOREIGN KEY → `auth.users(id)` `ON DELETE CASCADE`
- `serving_count` — CHECK: `serving_count > 0`
- `preparation_time_minutes` — CHECK: `preparation_time_minutes > 0`
- インデックス: `author_id`（ユーザーのレシピ一覧取得で使用）
- インデックス: `is_draft`（下書き一覧・公開済み一覧の絞り込みで使用）

## RLS ポリシー

`is_draft` の状態と家族関係（`family_members`）によってアクセス制御を行う。

### アクセス制御の考え方

```
is_draft = true（一時保存中）
  → 作成者（author_id = auth.uid()）のみ全操作可

is_draft = false（公開済み）
  → 作成者、または同じ家族のメンバーが全操作可
```

### ポリシー一覧

| 操作 | 条件 | 説明 |
|---|---|---|
| SELECT | `author_id = auth.uid()` | 自分の下書きは常に見える |
| SELECT | `is_draft = false` かつ 同じ家族のメンバー | 家族の公開済みレシピは見える |
| INSERT | `author_id = auth.uid()` | 自分の `author_id` でのみ作成できる |
| UPDATE | `author_id = auth.uid()` | 自分のレシピ（下書き含む）は常に更新できる |
| UPDATE | `is_draft = false` かつ 同じ家族のメンバー | 家族の公開済みレシピは更新できる |
| DELETE | `author_id = auth.uid()` | 自分のレシピ（下書き含む）は常に削除できる |
| DELETE | `is_draft = false` かつ 同じ家族のメンバー | 家族の公開済みレシピは削除できる |

「同じ家族のメンバー」の判定は `family_members` テーブルへのサブクエリで行う。
詳細は [`../family/family_members.md`](../family/family_members.md) を参照。

## 備考

- `is_draft` のデフォルトは `true`（作成直後は必ず一時保存状態）
- `updated_at` は `update_updated_at()` トリガー関数で自動更新する（[リファレンス参照](../postgresql-types-and-settings.md#supabase-固有の設定)）
- サムネイル画像の実体は Supabase Storage に保存し、このカラムには取得用の URL のみ格納する
- `ingredients`・`instructions`・`categories` は正規化のため別テーブルで管理する
- `recipe_ingredients`・`recipe_instructions`・`recipe_categories` の RLS も同様のロジックを適用する必要がある（各テーブルの定義書参照）
