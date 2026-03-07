# テーブル名: families

## 概要

家族グループを管理するテーブル。
1つの家族グループに複数のユーザーが所属し、グループ内でレシピを共有する。
ユーザーとの関係は `family_members`（中間テーブル）で管理する。

## ドメインモデルとの対応

対応するドメインモデルは未作成。
`src/domain/models/family/family.ts` として追加予定。

| ドメインモデルのフィールド（予定） | テーブルのカラム | 変換内容 |
|---|---|---|
| `id` | `id` | そのまま |
| `name` | `name` | そのまま |
| `createdAt` | `created_at` | camelCase → snake_case / `Date` ↔ `timestamptz` |

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | 主キー |
| `name` | `text` | NOT NULL | - | 家族グループ名（例: 田中家） |
| `created_at` | `timestamptz` | NOT NULL | `now()` | 作成日時 |

## 制約・インデックス

- `id` — PRIMARY KEY

## RLS ポリシー

| 操作 | 条件 | 説明 |
|---|---|---|
| SELECT | 自分が `family_members` に所属している `family_id` のみ | 自分の家族グループのみ参照できる |
| INSERT | 認証済みユーザーなら誰でも作成できる | 家族グループの新規作成 |
| UPDATE | 自分が所属している家族グループのみ | グループ名の変更など |
| DELETE | 不可（将来的に管理者ロールで対応を検討） | - |

## 備考

- 家族グループを作成したユーザーは、作成直後に自動で `family_members` に追加する（アプリ層で制御）
- 1ユーザーが複数の家族グループに所属することも将来的には可能な設計とする（現時点では想定しない）
