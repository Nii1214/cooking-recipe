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
| SELECT | `user_id = auth.uid()` OR 同じ `family_id` に所属している | 自分のメンバーシップ、または同じ家族のメンバー一覧を見られる |
| INSERT | 認証済みユーザーが `user_id = auth.uid()` で自分自身を追加する場合 | 招待リンク経由でグループに参加する想定 |
| DELETE | `user_id = auth.uid()` | 自分自身のみグループから脱退できる |

## 家族判定のサブクエリ（RLS での利用例）

`recipes` テーブルなど他テーブルの RLS ポリシーで「同じ家族かどうか」を判定する際は、
以下のサブクエリを `using` 句に組み込む。

```sql
-- 「自分と同じ family_id を持つメンバーが author_id である」ことを確認する
exists (
  select 1
  from family_members fm_author
  join family_members fm_self
    on fm_author.family_id = fm_self.family_id
  where fm_author.user_id = recipes.author_id
    and fm_self.user_id = auth.uid()
)
```

## 備考

- 家族グループの作成者は、作成後にアプリ層で自動的にこのテーブルへ INSERT する
- 招待の仕組み（招待リンク・コードなど）は別途設計が必要。現時点では未定
- UPDATE は想定しない（脱退して再参加するパターン）
