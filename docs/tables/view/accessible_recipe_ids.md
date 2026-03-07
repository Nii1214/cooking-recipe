# ビュー名: accessible_recipe_ids

## 概要

`recipes` テーブルの RLS を子テーブル（`recipe_categories` / `recipe_ingredients` / `recipe_instructions`）から再利用するためのビュー。

「このレシピにアクセス権があるか？」という判定を 1 か所に集約し、各子テーブルの RLS ポリシーをシンプルに保つ目的で作成している。

---

## 参照テーブル

| テーブル | 用途 |
|---|---|
| `recipes` | アクセス可能なレシピの ID を RLS に従って返す |

---

## 返却カラム

| カラム名 | 型 | 説明 |
|---|---|---|
| `id` | `uuid` | アクセス可能なレシピの ID |

---

## SQL 定義

```sql
create or replace view accessible_recipe_ids
  with (security_invoker = true)
as
  select id from recipes;
```

---

## セキュリティ設定：`security_invoker = true`

### なぜ必要か

PostgreSQL ではデフォルトで、ビューは**作成したユーザー（マイグレーション実行者＝スーパーユーザー）の権限**で動作する（`SECURITY DEFINER`）。

これにより `recipes` テーブルの RLS が**バイパスされ、全レシピの ID が全ユーザーに見えてしまう**という重大なセキュリティ問題が発生する。

```
SECURITY DEFINER（デフォルト）
  ↓
recipes テーブルの RLS がスキップ
  ↓
全ユーザーに全レシピID が見えてしまう 🚨
```

### `security_invoker = true` を設定した場合

ビューが**クエリを実行したユーザーの権限**で動作するようになり、`recipes` テーブルの RLS が正しく適用される。

```
security_invoker = true
  ↓
recipes テーブルの RLS が適用される
  ↓
そのユーザーがアクセスできるレシピ ID のみ返る ✅
```

> **Supabase Studio の警告**
> `SECURITY DEFINER` のビューに対して Supabase は警告を表示する。
> このビューには `security_invoker = true` が設定されているため、警告の対象外になっている。

---

## 使用箇所

子テーブルの RLS ポリシーで次のパターンを使用している。

```sql
-- recipe_ingredients の SELECT ポリシーの例
create policy "users can select accessible recipe ingredients"
  on recipe_ingredients for select
  using (
    exists (
      select 1 from accessible_recipe_ids where id = recipe_ingredients.recipe_id
    )
  );
```

このビューを経由することで、子テーブルの各ポリシーに
「自分のレシピか？同じ家族か？is_draft フラグはどうか？」
という複雑な条件を重複して書く必要がなくなる。

---

## 備考

- このビューは SELECT のみを返す（INSERT / UPDATE / DELETE は対象外）
- `recipes` テーブルの RLS が変更された場合、このビューを経由する子テーブルの挙動も自動的に追従する（定義の変更不要）
- `accessible_recipe_ids` はあくまで RLS 再利用のためのビューであり、アプリ層から直接クエリするためのものではない
