# ゲストユーザー削除バッチ — 実装スコープ

関連: [ADR 007: ゲストユーザーログイン](../../adr/07-guest-login.md)

## 採用方針

- **スケジュール**: 6 時間おき（Supabase pg_cron、`0 */6 * * *` UTC）
- **対象**: `is_anonymous = true` の全ユーザー（実行時点で存在するゲストすべて）
- **削除手段**: PostgreSQL 関数 `public.cleanup_anonymous_users()` が `auth.users` を DELETE → 既存 FK CASCADE で関連データ削除
- **配置**: **Supabase 側**（マイグレーション + pg_cron）。Vercel / Next.js / `service_role` は不使用

## 本 PR スコープ

| 層 | 内容 |
|----|------|
| DB | `cleanup_anonymous_users()` 関数 + pg_cron ジョブ（マイグレーション） |
| 運用 | 本番 `db push`、Cron ジョブ確認 |
| ドキュメント | 運用手順書（手動実行・ローカルテスト含む） |

## スコープ外

- S3 サムネイルの孤立ファイル削除
- 作成から N 時間未満だけ残す猶予ロジック（現状は実行時点の全ゲスト削除）
- Vercel Cron / Auth Admin API / `service_role`

## 完了条件

- マイグレーション適用後、pg_cron ジョブが Supabase Dashboard に表示される
- SQL Editor から `SELECT public.cleanup_anonymous_users()` で匿名ユーザーが削除できる
- 本登録ユーザー（`is_anonymous = false`）は対象外
- Vercel に追加の環境変数は不要

## 環境変数

**追加不要。** ゲストログインと同様 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` のみ。

運用手順: [ゲストユーザー削除バッチ — 運用手順書](../../guides/guest-cleanup-batch-operations.md)
