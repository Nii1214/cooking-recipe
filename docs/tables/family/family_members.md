# テーブル名: family_members

## 概要

ユーザーと家族グループの多対多の関係を管理する中間テーブル。
このテーブルが「同じ家族かどうか」を判断する根拠になる。
`recipes` テーブルの RLS ポリシーもこのテーブルを参照して家族共有の制御を行う。

## ドメインモデルとの対応

中間テーブルのため対応するドメインモデルは持たない。
家族メンバーシップの判定はリポジトリ層で行う。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `family_id` | `uuid` | NOT NULL | - | 所属する家族グループ（`families.id` を参照） |
| `user_id` | `uuid` | NOT NULL | - | メンバーのユーザー（`auth.users.id` を参照） |
| `joined_at` | `timestamptz` | NOT NULL | `now()` | グループに参加した日時 |

## 制約・インデックス

- PRIMARY KEY: `(family_id, user_id)` の複合主キー（同じ組み合わせの重複を防ぐ）
- `family_id` — FOREIGN KEY → `families(id)` `ON DELETE CASCADE`（家族グループ削除時に自動削除）
- `user_id` — FOREIGN KEY → `auth.users(id)` `ON DELETE CASCADE`（ユーザー削除時に自動削除）
- インデックス: `user_id`（ユーザーが所属する家族グループを検索するため）

## RLS ポリシー

| 操作 | 条件 | 説明 |
|---|---|---|
| SELECT | 同じ `family_id` に所属している | 同じ家族のメンバー一覧を見られる |
| INSERT | `user_id = auth.uid()` で自分自身を追加する場合 | 招待リンク経由でグループに参加する想定 |
| DELETE | `user_id = auth.uid()` | 自分自身のみグループから脱退できる |

### RLS の実装：なぜ `security definer` 関数が必要か

**問題：RLS ポリシーが自テーブルを参照すると無限再帰が発生する**

SELECT ポリシーを素直に書くと、次のようになります。

```sql
-- NG: 自テーブルを参照するため無限再帰が発生する
create policy "メンバー一覧を見られる"
  on family_members for select
  using (
    exists (
      select 1 from family_members fm  -- ← family_members を参照
      where fm.family_id = family_members.family_id
        and fm.user_id = auth.uid()
    )
  );
```

このポリシーを評価するたびに `family_members` への SELECT が発生し、
そのたびにまた RLS が発動して同じポリシーを評価しようとします。
結果として無限ループが起きてエラーになります。

```
① family_members を SELECT → RLS 発動 → ポリシー評価開始
② ポリシーが family_members を SELECT → RLS 発動 → ポリシー評価開始
③ ポリシーが family_members を SELECT → RLS 発動 → ポリシー評価開始
④ ∞（エラー）
```

---

**解決策：`security definer` 関数を「判定材料取得の窓口」として使う**

`security definer` 関数は RLS をバイパスして直接テーブルを読めます。
ポリシーの「判定材料を取得する部分」だけをこの関数に切り出すことで再帰を防ぎます。

```sql
-- 現在のユーザーが所属する family_id の一覧を返す（再帰しない）
create or replace function get_my_family_ids()
returns setof uuid
language sql
security definer  -- RLS をバイパスして直接テーブルを参照する
stable
as $$
  select family_id from family_members where user_id = auth.uid();
$$;

-- ポリシーは関数を使って判定する（自テーブルを直接参照しない）
create policy "members can select family members"
  on family_members for select
  using (family_id in (select get_my_family_ids()));
```

実際の動作フロー：

```
① 田中さんが family_members を SELECT
② RLS 発動 → ポリシー評価開始
③ get_my_family_ids() を呼ぶ（security definer のため再帰しない）
    → "SELECT family_id FROM family_members WHERE user_id = 田中さん" を直接実行
    → family_id = 1 を返す
④ ポリシーが「family_id = 1 のレコードのみ許可」と判定
⑤ family_id = 1 のレコードだけ返す（別グループのレコードは弾かれる）
```

**RLS は必ず通ります。** `security definer` はポリシーの判定材料を取得する部分にのみ使っており、
最終的なアクセス許可・拒否の判断は RLS ポリシーが行います。

---

**まとめ**

| | 説明 |
|---|---|
| RLS が無効になるか | **なりません**。SELECT は必ず RLS を通ります |
| `security definer` が何をするか | ポリシーの「判定材料取得」部分だけ再帰しない方法で実装する |
| なぜ必要か | `family_members` のポリシーが `family_members` 自身を参照するという構造的な制約のため |

この設計パターンは Supabase 公式でも推奨されています。

## 家族判定ヘルパー関数（他テーブルの RLS での利用）

`recipes` など他テーブルの RLS ポリシーで「同じ家族かどうか」を判定する際は、
`is_same_family(uuid)` 関数を使います（マイグレーション `20260307000002` で定義）。

```sql
-- p_user_id が auth.uid() と同じ家族に所属しているかを返す
create or replace function is_same_family(p_user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from family_members fm_a
    join family_members fm_b on fm_a.family_id = fm_b.family_id
    where fm_a.user_id = p_user_id
      and fm_b.user_id = auth.uid()
  );
$$;
```

利用例（`recipes` テーブルの RLS）：

```sql
create policy "family members can select published recipes"
  on recipes for select
  using (
    is_draft = false
    and is_same_family(author_id)  -- ← ここで利用
  );
```

## 備考

- 家族グループの作成者は、作成後にアプリ層で自動的にこのテーブルへ INSERT する
- 招待の仕組み（招待リンク・コードなど）は別途設計が必要。現時点では未定
- UPDATE は想定しない（脱退して再参加するパターン）
