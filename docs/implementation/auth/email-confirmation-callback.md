# メール確認リンク / auth callback

関連: [BACKLOG.md](../../../BACKLOG.md) Bugs / Ops
しくみの解説: [メール確認と /auth/callback のしくみ](../../tips/email-confirmation-and-auth-callback.md)

## 問題

- 新規登録の確認メールリンクが `localhost` を指す
  （例: `.../auth/v1/verify?token=pkce_...&type=signup&redirect_to=http://localhost:3000`）
- `/auth/callback` が存在せず、戻ってきてもセッションが確立されない

## 採用方針

| 項目 | 内容 |
|------|------|
| **アプリ** | `GET /auth/callback` Route Handler で `exchangeCodeForSession`（`token_hash` 形式は `verifyOtp`） |
| **サインアップ** | `signUp` の `emailRedirectTo` に `{オリジン}/auth/callback` を指定 |
| **オリジン解決** | `NEXT_PUBLIC_SITE_URL` を最優先。未設定時はリクエストのホストから組み立て |
| **Supabase Cloud** | Site URL・Redirect URLs を本番 URL に設定（下記の運用手順） |

## 実装

| ファイル | 役割 |
|---------|------|
| `src/lib/site-url.ts` | `getSiteOrigin()`。絶対 URL のベースを解決する |
| `src/constants/auth.ts` | コールバックのパスと遷移先の定数 |
| `src/infrastructure/repositories/auth-repository-impl.ts` | `signUp` に `emailRedirectTo` を渡す |
| `src/app/auth/callback/route.ts` | `code` / `token_hash` を検証してセッションを確立し、`/top` へ遷移 |
| `src/proxy.ts` | `/auth/callback` を公開パスに追加（セッション確立前に到達するため） |
| `src/app/(auth)/login/page.tsx` | `?authError=1` のとき、リンク無効の案内を表示 |

### リダイレクト先の決まり方

1. `NEXT_PUBLIC_SITE_URL` が設定されていればそのオリジン
2. 未設定なら `x-forwarded-host` → `host` の順でリクエストのホスト
3. どちらも取れなければ `http://localhost:3000`

確認メールは送信時とは別の環境・端末で開かれるため、**本番では 1 の環境変数で固定する**。

### `next` クエリ

`/auth/callback?next=/recipe/new` のように遷移先を指定できる。
`//` 始まりや外部 URL はオープンリダイレクト対策で無視し、`/top` にフォールバックする。

## 環境変数

| 変数 | 用途 | 例 |
|------|------|-----|
| `NEXT_PUBLIC_SITE_URL` | `emailRedirectTo` のベース URL | `https://cooking-recipe.example.com` |

ローカルでは未設定でよい（リクエストのホストから `http://localhost:3000` が組み立てられる）。

## 運用手順（Supabase Cloud）

アプリ側だけを直しても、Supabase は `redirect_to` を許可リストと照合し、
一致しない場合は **Site URL にフォールバックする**。ダッシュボード側の設定が必須。

1. Authentication → URL Configuration を開く
2. **Site URL** を本番 URL（`https://<本番ドメイン>`）にする
3. **Redirect URLs** に以下を追加する
   - `https://<本番ドメイン>/auth/callback`
   - プレビュー環境を使う場合は `https://<プレビュードメイン>/auth/callback`
4. ホスティング側の環境変数に `NEXT_PUBLIC_SITE_URL=https://<本番ドメイン>` を設定して再デプロイ

ローカル（`supabase start`）は `supabase/config.toml` の `[auth]` に設定済み。

## 完了条件

- 本番 URL で新規登録 → 確認メール → リンククリック → ログイン状態で `/top` へ遷移
- リンクが期限切れ・改ざんされている場合は `/login?authError=1` で案内が出る
- ローカルでも `http://localhost:3000` で同じ流れを確認できる

## スコープ外

- カスタム SMTP
- パスワードリセットメール（`/auth/callback` は `recovery` も受け付けるため、遷移先の出し分けのみ別 PR）
