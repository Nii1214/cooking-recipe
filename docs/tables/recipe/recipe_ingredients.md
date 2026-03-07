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
| `name` | `name` | そのまま（表示用。例: "人参（みじん切り）"） |
| `quantity`（表示用） | `quantity_display` | カラムを分割。表示文字列は `quantity_display` へ |
| `quantity`（数値） | `quantity_value` | カラムを分割。数値計算用は `quantity_value` へ（NULL 許容） |
| `unit` | `unit` | そのまま |
| `note` | `note` | そのまま |
| `order` | `order_position` | `order` は SQL 予約語のため `order_position` に変更 |
| ※なし | `recipe_id` | DB 側の外部キー（ドメインモデルには含まない） |
| ※なし | `ingredient_id` | DB 側の外部キー。材料マスター `ingredients.id` への nullable 参照 |

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | 主キー |
| `recipe_id` | `uuid` | NOT NULL | - | 所属するレシピ（`recipes.id` を参照） |
| `ingredient_id` | `uuid` | NULL 許容 | - | 材料マスター（`ingredients.id` を参照）。未紐付けの場合は NULL |
| `name` | `text` | NOT NULL | - | ユーザーが入力した表示用の材料名（例: "人参（みじん切り）"） |
| `quantity_display` | `text` | NOT NULL | - | 表示用の量（例: `"1.5"`, `"適量"`, `"少々"`） |
| `quantity_value` | `numeric` | NULL 許容 | - | 数値計算用の量（例: `1.5`）。「適量」「少々」の場合は NULL |
| `unit` | `text` | NOT NULL | - | 単位（例: 本、g、小さじ1） |
| `note` | `text` | NULL 許容 | - | 補足メモ（例: 乱切りにしておく） |
| `order_position` | `integer` | NOT NULL | - | 表示順（1始まり） |
| `created_at` | `timestamptz` | NOT NULL | `now()` | 作成日時 |

## 制約・インデックス

- `id` — PRIMARY KEY
- `recipe_id` — FOREIGN KEY → `recipes(id)` `ON DELETE CASCADE`（レシピ削除時に自動削除）
- `ingredient_id` — FOREIGN KEY → `ingredients(id)` `ON DELETE SET NULL`（マスター削除時は NULL に）
- `order_position` — CHECK: `order_position > 0`
- インデックス: `(recipe_id, order_position)`（レシピの材料一覧を順番通りに取得するため）
- インデックス: `ingredient_id`（材料マスターでの逆引き検索のため）

## RLS ポリシー

`accessible_recipe_ids` ビューを通じて `recipes` の RLS を再利用する（レビュー指摘 I-2 対応）。
これにより各ポリシーに `is_same_family()` を直接記述する必要がなくなり、シンプルになる。

| 操作 | 実装 | 説明 |
|---|---|---|
| SELECT | `recipe_id in (select id from accessible_recipe_ids)` | 自分のレシピ（下書き含む）+ 家族の公開済みレシピの材料を参照できる |
| INSERT | `exists (select 1 from recipes where id = recipe_id and author_id = auth.uid())` | 自分のレシピにのみ材料を追加できる（家族メンバーは不可） |
| UPDATE | `recipe_id in (select id from accessible_recipe_ids)` | 自分のレシピ（下書き含む）+ 家族の公開済みレシピの材料を更新できる |
| DELETE | `recipe_id in (select id from accessible_recipe_ids)` | 自分のレシピ（下書き含む）+ 家族の公開済みレシピの材料を削除できる |

## 備考

- `order` は PostgreSQL の予約語（`ORDER BY` など）と衝突するため、カラム名は `order_position` とする
- `quantity` を `quantity_display` / `quantity_value` に分割した理由（レビュー指摘 I-5）：
  - `quantity_display`（text）: 「適量」「少々」など自由記述を可能にする表示用
  - `quantity_value`（numeric）: 「2人前 → 4人前にスケールアップ」など将来的な数値計算に対応するための数値型
  - アプリ層で入力値が数値に変換可能であれば両方セットし、そうでなければ `quantity_value = NULL` にする
- RLS は `accessible_recipe_ids` ビュー経由で制御する（`recipes` の RLS が自動適用される）

## ⚠️ 懸念点

### ingredient_id の扱いが形骸化するリスク

`ingredient_id` は nullable であり、レシピ登録時にマスターへの紐付けは必須ではありません。
この設計は UX を優先した意図的な選択ですが、以下の点に注意が必要です。

- アプリ層で `ingredient_id` を積極的にセットする仕組みを作らないと、カラムが常に NULL になり実質的に意味をなさなくなる
- 「材料での横断検索」などの機能を将来追加したい場合、`ingredient_id = NULL` のレコードが多いと使い物にならない
- 対応方針については [`ingredients.md`](./ingredients.md) の懸念点セクションを参照
