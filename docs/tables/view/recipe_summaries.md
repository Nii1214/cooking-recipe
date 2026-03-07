# ビュー名: recipe_summaries

## 概要

レシピ一覧画面向けの集約ビュー。
`recipes` テーブルとカテゴリ情報を 1 クエリで取得することで、N+1 問題を防ぐ目的で作成している。

---

## 参照テーブル

| テーブル | 結合方法 | 用途 |
|---|---|---|
| `recipes` | ベーステーブル | レシピ基本情報 |
| `recipe_categories` | `LEFT JOIN` | レシピとカテゴリの紐付け |
| `categories` | `LEFT JOIN` | カテゴリ名・slug の取得 |

---

## 返却カラム

| カラム名 | 型 | 説明 |
|---|---|---|
| `id` | `uuid` | レシピ ID |
| `title` | `text` | レシピタイトル |
| `description` | `text` | レシピの説明 |
| `thumbnail_url` | `text` | サムネイル画像 URL |
| `serving_count` | `integer` | 何人前 |
| `preparation_time_minutes` | `integer` | 調理時間（分） |
| `is_draft` | `boolean` | 下書きフラグ |
| `author_id` | `uuid` | 作成者の `auth.users.id` |
| `created_at` | `timestamptz` | 作成日時 |
| `updated_at` | `timestamptz` | 更新日時 |
| `categories` | `json` | カテゴリの配列（`[{"id": "...", "name": "...", "slug": "..."}]`） |

### `categories` カラムの形式

```json
[
  { "id": "uuid", "name": "和食", "slug": "japanese" },
  { "id": "uuid", "name": "夕食", "slug": "dinner" }
]
```

カテゴリが存在しない場合は空配列 `[]` を返す（`COALESCE` により `NULL` にならない）。

---

## SQL 定義

```sql
create or replace view recipe_summaries
  with (security_invoker = true)
as
  select
    r.id,
    r.title,
    r.description,
    r.thumbnail_url,
    r.serving_count,
    r.preparation_time_minutes,
    r.is_draft,
    r.author_id,
    r.created_at,
    r.updated_at,
    coalesce(
      json_agg(
        json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)
        order by c.name
      ) filter (where c.id is not null),
      '[]'
    ) as categories
  from recipes r
  left join recipe_categories rc on rc.recipe_id = r.id
  left join categories c on c.id = rc.category_id
  group by r.id;
```

---

## セキュリティ設定：`security_invoker = true`

[`accessible_recipe_ids.md`](./accessible_recipe_ids.md) と同様の理由で設定している。

`security_invoker = true` がないと、`recipes` テーブルの RLS がバイパスされ、
全ユーザーが全レシピのサマリーを参照できてしまうため必須の設定。

---

## 設計上のポイント

### N+1 問題の解消

レシピ一覧画面では「各レシピが持つカテゴリ一覧」が必要になる。
ナイーブな実装では以下のような N+1 クエリが発生する。

```
1. SELECT * FROM recipes;               → N件取得
2. SELECT * FROM recipe_categories WHERE recipe_id = 'id1';
3. SELECT * FROM recipe_categories WHERE recipe_id = 'id2';
... N+1 回クエリが発生
```

このビューを使うことで、1 回のクエリでレシピとカテゴリをまとめて取得できる。

### `group by r.id` が安全な理由

`r.id` は `recipes` テーブルの PRIMARY KEY のため、PostgreSQL は関数従属性を認識する。
`r.id` だけで `GROUP BY` しても、他のカラム（`r.title` など）は確定値として扱えるため、全カラムを列挙せずに済む。

### `FILTER (WHERE c.id IS NOT NULL)` の意味

`LEFT JOIN` によりカテゴリが存在しない場合は `c.id = NULL` になる。
この行を `json_agg` に含めると `[null]` が生成されてしまうため、`FILTER` で除外している。

---

## 備考

- 材料・手順はレシピ詳細画面で取得するため、このビューには含めていない（一覧画面では不要なデータを取得しない）
- `recipes` テーブルの RLS が変更された場合、このビューの結果も自動的に追従する
