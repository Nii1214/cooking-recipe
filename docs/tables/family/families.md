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
| `ownerId` | `owner_id` | camelCase → snake_case |
| `createdAt` | `created_at` | camelCase → snake_case / `Date` ↔ `timestamptz` |

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | 主キー |
| `name` | `text` | NOT NULL | - | 家族グループ名（例: 田中家） |
| `owner_id` | `uuid` | NOT NULL | - | グループのオーナー（`auth.users.id` を参照）。グループ名の変更などができる |
| `created_at` | `timestamptz` | NOT NULL | `now()` | 作成日時 |

## 制約・インデックス

- `id` — PRIMARY KEY
- `owner_id` — FOREIGN KEY → `auth.users(id)`（ユーザー削除時の挙動は要検討。現時点は制約のみ）
- インデックス: `owner_id`（UPDATE ポリシー `owner_id = auth.uid()` の評価で使用）

## RLS ポリシー

| 操作 | 条件 | 説明 |
|---|---|---|
| SELECT | 自分が `family_members` に所属している `family_id` のみ | 自分の家族グループのみ参照できる |
| INSERT | `auth.uid() is not null`（認証済みユーザー） | 家族グループの新規作成 |
| UPDATE | `owner_id = auth.uid()` | グループのオーナーのみ更新できる |
| DELETE | 不可（将来的に管理者ロールで対応を検討） | - |

## 備考

- `owner_id` はグループを作成したユーザーを指す。アプリ層で `INSERT families` と同時に `INSERT family_members` を行い、作成者を最初のメンバーとして登録する
- UPDATE ポリシーはメンバー全員ではなく `owner_id` のみに絞ることで、意図しないグループ名変更を防ぐ（レビュー指摘 I-4 対応）
- 1ユーザーが複数の家族グループに所属することも将来的には可能な設計とする（現時点では想定しない）
