# ゲストログイン — 実装スコープ

関連: [ADR 007: ゲストユーザーログイン](../../adr/07-guest-login.md)

## 採用方針

- **案 A**: Supabase Anonymous Sign-In
- **権限**: 既存 RLS（`auth.uid()`）のまま。ゲストもデータ登録・操作は自由
- **データ寿命**: 日次バッチで匿名ユーザーと関連データを削除（別 PR / 運用）

## 第 1 PR（本スコープ）

| 層 | 内容 |
|----|------|
| Supabase | `enable_anonymous_sign_ins`、`families.owner_id` ON DELETE CASCADE |
| domain | `AuthRepository.signInAnonymously()` |
| infrastructure | Supabase `signInAnonymously` 実装 |
| usecase | `guestLoginUsecase` |
| app | `guestLoginAction` |
| presentation | ログイン画面・LP に「ゲストで試す」 |

## スコープ外（後続）

- Identity Linking による本登録
- 日次バッチ（匿名ユーザー削除ジョブ）
- CAPTCHA

## 完了条件

- ログイン画面・LP からゲストログイン → `/top`（未プロフィールなら `/profile/new`）まで到達できる

## ローカル開発時の注意

`supabase/config.toml` で Anonymous Sign-Ins を有効にしても、**既に起動中の Supabase には反映されません**。

```bash
npx supabase stop && npx supabase start
```

または `npm run supabase:restart` を実行してください。
