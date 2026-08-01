# メール確認リンク / auth callback — 実装スコープ

関連: [BACKLOG.md](../../../BACKLOG.md) Bugs / Ops

## 問題

- 新規登録の確認メールリンクが `localhost` を指す、または `/auth/callback` が存在せず 404 になる
- Supabase Auth の確認フロー完了後にセッションが確立されない

## 採用方針（予定）

| 項目 | 内容 |
|------|------|
| **アプリ** | `GET /auth/callback` Route Handler で `exchangeCodeForSession` |
| **サインアップ** | `signUp` に `emailRedirectTo` を本番 / ローカルで正しい URL に設定 |
| **Supabase Cloud** | Site URL・Redirect URLs を本番 URL に設定（運用手順） |

## スコープ外

- カスタム SMTP
- パスワードリセットメール（同 Route を流用可能なら別 PR 可）

## 完了条件

- 本番 URL で新規登録 → 確認メール → リンククリック → ログイン状態で `/top` 等へ遷移
- ローカルでも `http://127.0.0.1:54321` / `localhost:3000` で確認できる

## 環境変数（検討）

| 変数 | 用途 |
|------|------|
| `NEXT_PUBLIC_SITE_URL` | `emailRedirectTo` のベース URL（任意・未設定時は request origin） |
