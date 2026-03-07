# テーブル名: ingredients

## 概要

材料のマスターデータを管理するテーブル。
`recipe_ingredients.ingredient_id` から参照され、表記ゆれの吸収・将来の材料検索機能に対応する。
`recipe_ingredients.name`（表示用）とは別に、正規化された名前を保持する。

## ドメインモデルとの対応

対応するドメインモデルは未作成。将来的に `src/domain/models/recipe/ingredient-master.ts` として追加予定。

| ドメインモデルのフィールド（予定） | テーブルのカラム | 変換内容 |
|---|---|---|
| `id` | `id` | そのまま |
| `name` | `name` | そのまま |
| `normalizedName` | `normalized_name` | camelCase → snake_case |
| `createdAt` | `created_at` | camelCase → snake_case / `Date` ↔ `timestamptz` |

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | 主キー |
| `name` | `text` | NOT NULL | - | 材料の標準表示名（例: 人参） |
| `normalized_name` | `text` | NOT NULL | - | 検索・突合せ用の正規化名（小文字化・空白除去・表記ゆれ統一後。例: `にんじん`） |
| `created_at` | `timestamptz` | NOT NULL | `now()` | 作成日時 |

## 制約・インデックス

- `id` — PRIMARY KEY
- `normalized_name` — UNIQUE インデックス（重複登録を防ぎ、検索を高速化）

## RLS ポリシー

カテゴリと同様、マスターデータのため読み取りは認証済みユーザーに許可。
書き込みはサービスロールキーで操作し、正規化処理はサーバーサイドで管理する。

| 操作 | 実装 | 説明 |
|---|---|---|
| SELECT | `auth.uid() is not null` | 認証済みユーザーは全件参照できる |
| INSERT | `with check (false)` | サービスロールキーで操作 |
| UPDATE | `using (false)` | サービスロールキーで操作 |
| DELETE | `using (false)` | サービスロールキーで操作 |

## `recipe_ingredients` との関係

```
recipe_ingredients.ingredient_id (nullable) ─── ingredients.id
recipe_ingredients.name                     ← ユーザーが入力した表示用名（例: "人参（みじん切り）"）
ingredients.name                            ← 標準名（例: "人参"）
ingredients.normalized_name                 ← 検索用（例: "にんじん"）
```

`ingredient_id` は nullable のため、未登録の材料を使ったレシピでも問題なく保存できる。
正規化は段階的に進められる（管理者がバッチ処理で紐付けするなど）。

## 備考

- `normalized_name` の正規化ルール（例: 小文字化、ひらがな統一、空白除去）はアプリ層またはサーバーサイドで定義する
- 将来的に「この材料を使ったレシピ一覧」などの検索機能を追加する際に活用する
- ユーザーが自由に材料を登録する機能を追加する場合は INSERT ポリシーを見直す

## ⚠️ 懸念点・設計上のトレードオフ

### ingredient_id は nullable — マスター紐付けの一貫性が保証されない

`recipe_ingredients.ingredient_id` は nullable のため、ユーザーは `ingredients` マスターに存在しない材料名でも自由にレシピを登録できます。
これは UX 上の意図した設計ですが、以下の問題が将来発生する可能性があります。

| 懸念 | 説明 |
|---|---|
| **表記ゆれの蓄積** | 「人参」「にんじん」「ニンジン」が別々のレシピに混在し、材料での横断検索が効かない |
| **マスターとの乖離** | `ingredient_id = NULL` のレコードが増えるほど材料マスターの価値が下がる |
| **正規化コスト増大** | 後からまとめて正規化しようとすると、手動作業またはバッチ処理のコストが大きくなる |
| **ingredient_id の使われ方が不明確** | アプリ層で `ingredient_id` を積極的にセットしないと、カラムが形骸化する |

### 対応の方向性（実装時に決定すること）

1. **自動サジェスト方式（推奨）**
   材料名を入力中に `ingredients` マスターをあいまい検索し、候補を表示する。
   候補を選択した場合は `ingredient_id` をセット、自由入力の場合は NULL のまま。
   UX を損なわず、段階的にマスターへの紐付けを増やせる。

2. **バッチ正規化方式**
   初期は全レコードを `ingredient_id = NULL` で運用し、
   定期的に管理者がバッチ処理で `name` を解析・紐付けを行う。

3. **現状維持（マスター機能を凍結）**
   材料検索機能が不要であれば、`ingredients` テーブルと `ingredient_id` カラムを
   将来のマイグレーションまで追加しないという選択肢もある。
