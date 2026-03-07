# `docs/tables` について

## 概要

このディレクトリはプロジェクトで使用するテーブルの定義書を管理します。
マイグレーションを書く前にここでテーブル設計をドキュメントとして整理し、
設計の意思決定を記録・共有することを目的としています。

---

## ディレクトリ構成

```
docs/tables/
├── README.md                            ← このファイル。全体ルール・規約
├── postgresql-types-and-settings.md     ← PostgreSQL / Supabase の型・設定リファレンス
├── recipe/                              ← レシピドメイン
│   ├── recipes.md                       ← レシピ基本情報（is_draft による一時保存含む）
│   ├── categories.md                    ← カテゴリマスター
│   ├── recipe_categories.md             ← レシピ×カテゴリ（中間テーブル）
│   ├── recipe_ingredients.md            ← 材料
│   └── recipe_instructions.md          ← 調理手順
├── family/                              ← 家族ドメイン
│   ├── families.md                      ← 家族グループ
│   └── family_members.md               ← ユーザー×家族グループ（中間テーブル）
└── auth/                                ← 認証ドメイン（追加予定）
    └── profiles.md
```

新しいドメインが増えた場合は、`src/domain/models/` のサブディレクトリと対応させてディレクトリを追加します。

---

## テーブル定義書のフォーマット

各テーブルにつき 1 ファイル作成します。以下のセクション構成を統一して使います。

```markdown
# テーブル名: {table_name}

## 概要
このテーブルが表すもの・役割を 1〜2 行で説明する。

## ドメインモデルとの対応
対応する `src/domain/models/` のファイルを記載する。
ドメインモデルのフィールドとテーブルのカラムの対応表を書く。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| id | uuid | NOT NULL | gen_random_uuid() | 主キー |

## 制約・インデックス
- 外部キー・UNIQUE・CHECK 制約を箇条書きで記載する
- インデックスも記載する

## RLS ポリシー
どのロール・条件でアクセスを許可するかを記載する。

## 備考
設計上の意思決定や注意点があれば記載する。
```

型・デフォルト値・RLS の書き方は [`postgresql-types-and-settings.md`](./postgresql-types-and-settings.md) を参照してください。

---

## 全体共通ルール

### 命名規則

| 対象 | 規則 | 例 |
|---|---|---|
| テーブル名 | snake_case・複数形 | `recipes`, `recipe_ingredients` |
| カラム名 | snake_case | `author_id`, `created_at` |
| 中間テーブル | `{テーブルA}_{テーブルB}` の形式 | `recipe_categories` |
| インデックス名 | 自動命名に任せる（明示する場合は `idx_{テーブル}_{カラム}` ） | `idx_recipes_author_id` |
| ポリシー名 | 動詞＋対象で英語スネークケース | `"authenticated users can read recipes"` |

---

### 主キーの設計方針

**本プロジェクトでは主キーに `uuid` を採用します。**

#### UUID を採用する理由

1. **Supabase の標準が UUID** であり、公式ドキュメントや生成される型定義もこれを前提とする
2. **`auth.users.id` が UUID** のため、外部キーの型を全テーブルで統一できる
3. **URL から件数・順番が推測されない**（`/recipes/1`, `/recipes/2`... のような連番露出がない）
4. **家族向けの規模**では UUID v4 のパフォーマンス問題は実際には発生しない

#### 連番 ID（`bigserial`）を採用しない理由

- INSERT は連番の方が高速だが、本プロジェクトの規模では差が出ない
- URL に露出した場合にレコード数・作成順が推測される
- `auth.users.id`（UUID）との型の不一致が生じる

#### UUID v4 のパフォーマンスについて

UUID v4 は完全ランダムな値のため、大量データ時にインデックスの断片化が起きやすいという特性があります。
本プロジェクトの規模では実用上問題ありませんが、将来的にスケールする場合は **UUID v7**（時刻順に並ぶ UUID）への移行を検討します。

```sql
-- UUID v7 を使う場合（pg_uuidv7 拡張が必要）
create extension if not exists "pg_uuidv7";
id uuid primary key default uuid_generate_v7()
```

---

### 日時カラムの設計方針

- 日時カラムは必ず **`timestamptz`（タイムゾーン付き）** を使います
- `created_at` はすべてのテーブルに設けます
- `updated_at` はレコードの更新が発生するテーブルにのみ設けます
- `updated_at` の自動更新はトリガー関数 `update_updated_at()` で行います（[詳細](./postgresql-types-and-settings.md#supabase-固有の設定)）

---

### 外部キーの削除ポリシー

| 関係 | ポリシー | 理由 |
|---|---|---|
| 親レコードが削除されたら子も不要になるもの | `ON DELETE CASCADE` | `recipes` → `recipe_ingredients` など |
| 親レコードが削除されても子を残したいもの | `ON DELETE SET NULL` | 将来的なソフトデリートなど |
| 親レコードを削除させたくないもの | `ON DELETE RESTRICT` | マスターデータの保護など |

**本プロジェクトの基本方針**: レシピ削除時に材料・手順・カテゴリの紐付けも一緒に消えるべきなので、`ON DELETE CASCADE` を標準とします。

---

### RLS の設計方針

すべてのテーブルで **RLS を有効化** します（Supabase のセキュリティベストプラクティス）。

本プロジェクトは**クローズドな家族向けアプリ**のため、アクセス制御は以下の 2 軸で考えます。

#### 軸1: 一時保存フラグ（`is_draft`）

`recipes.is_draft` が `true` の間は作成者のみが操作できます。
`false`（公開済み）になると、同じ家族グループのメンバーも操作できます。

```
is_draft = true（一時保存中）  → 作成者のみ全操作可
is_draft = false（公開済み）   → 作成者 または 同じ家族のメンバーが全操作可
```

#### 軸2: 家族メンバー判定

「同じ家族かどうか」は `family_members` テーブルへのサブクエリで判定します。
詳細は [`family/family_members.md`](./family/family_members.md) を参照してください。

#### まとめ

| 操作 | 基本方針 |
|---|---|
| SELECT | 自分のレシピ、または `is_draft = false` かつ同じ家族のレシピを読み取れる |
| INSERT | `auth.uid()` と `author_id` が一致する場合のみ作成できる |
| UPDATE | 自分のレシピ、または `is_draft = false` かつ同じ家族のレシピを更新できる |
| DELETE | 自分のレシピ、または `is_draft = false` かつ同じ家族のレシピを削除できる |

カテゴリなどのマスターデータは INSERT / UPDATE / DELETE をアプリユーザーに開放せず、サービスロールキーで直接操作します。

---

### カラムの型選定指針

| データの種類 | 採用する型 | 理由 |
|---|---|---|
| 文字列全般 | `text` | `varchar` と性能差なし。長さ制限は CHECK 制約で表現 |
| 整数 | `integer` | 通常の件数・順番・分数など |
| 量・個数の文字列（「適量」など） | `text` | 「少々」「適量」などの文字も入力できるようにするため |
| 日時 | `timestamptz` | タイムゾーン付きで UTC 保存 |
| 真偽値 | `boolean` | - |
| 主キー | `uuid` | 上記「主キーの設計方針」を参照 |
| 画像 | `text`（URL） | 実体は Supabase Storage に保存し、URL のみ持つ |
