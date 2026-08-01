# Backlog

## Refactors

- [ ] auth の deps パターン統一（DIContainer → deps 直渡し）→ [ADR 007](docs/adr/07-guest-login.md)
- [ ] 認証・認可まわりの責務整理（usecase / action / proxy の境界）

## Features

- [x] ゲストログイン（Anonymous Sign-In）
- [x] ゲスト削除バッチ（pg_cron + SQL、6 時間おき）
- [ ] Identity Linking（ゲスト → 本登録）
- [ ] 家族への招待・参加 UI（ADR 005 では DB のみ、UI は後続）
- [ ] ゲスト向け RLS 関門（`is_permanent_user()` 等）— 家族参加実装時

## Bugs

- [ ] `/auth/callback`（登録メールからリンクを踏むと存在しないリンクに飛ばされる）


## Ops

- [ ] Vercel: Preview デプロイを止める（Ignored Build Step → Only build production）
- [ ] 本番 Supabase: Anonymous Sign-Ins を ON
- [ ] 本番 Supabase: `npx supabase db push`（CASCADE マイグレーション含む）
- [ ] 本番 Supabase: Site URL を本番 URL に設定（確認メールの localhost 問題）


## Inbox（未分類・殴り書き）

思い分けが面倒なときはここに書いて、あとで上のセクションへ移す。

- [ ]
