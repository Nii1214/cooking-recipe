# メール確認と /auth/callback のしくみ

新規登録の確認メールまわりで実際に起きた不具合と、その修正で書いたコードの解説です。
「なぜそう書くのか」を認証の前提知識から順に説明します。

関連: [実装スコープ](../implementation/auth/email-confirmation-callback.md) / [ADR 02 Supabase](../adr/02-Supabase.md)

---

## 1. そもそもメール確認は何のためにあるのか

メールアドレスとパスワードで登録できるサービスには、次の問題があります。

- 他人のメールアドレスで勝手に登録できてしまう（なりすまし）
- 打ち間違いに気づけない（パスワード再設定メールが永久に届かない）

そこで「登録直後のユーザーは**未確認**として扱い、本人のメールボックスに届いたリンクを
踏めた場合だけ確認済みにする」という手順を挟みます。
**メールボックスを開けること自体が本人確認になっている**、というのがこの仕組みの本質です。

このアプリでは Supabase 側の設定で確認を必須にしています（`supabase/config.toml` の
`[auth.email] enable_confirmations = true`）。確認が済むまでログインはできません。

---

## 2. 全体の流れ

```
① ユーザー          → アプリ            : メールアドレスとパスワードで登録
② アプリ            → Supabase Auth     : signUp(email, password, { emailRedirectTo })
③ Supabase Auth                         : 未確認ユーザーを作成し、確認メールを送信
④ ユーザー                              : メール内のリンクをクリック
⑤ ブラウザ          → Supabase Auth     : GET /auth/v1/verify?token=...&type=signup&redirect_to=...
⑥ Supabase Auth                         : トークンを検証し、ユーザーを確認済みにする
⑦ Supabase Auth     → ブラウザ          : redirect_to に ?code=... を付けてリダイレクト
⑧ ブラウザ          → アプリ            : GET /auth/callback?code=...
⑨ アプリ            → Supabase Auth     : exchangeCodeForSession(code)
⑩ Supabase Auth     → アプリ            : セッション（アクセストークン）を発行
⑪ アプリ            → ブラウザ          : Cookie にセッションを保存して /top へリダイレクト
```

ポイントは **⑥ の時点でメール確認そのものは完了している** ことです。
⑧ 以降は「せっかく本人だと分かったので、そのままログイン状態にしてあげる」ための処理で、
なくてもユーザーが手動でログインすれば使えます。

---

## 3. 今回の不具合：なぜ本番のリンクが localhost だったのか

届いていたリンクはこうでした。

```
https://<project>.supabase.co/auth/v1/verify
  ?token=pkce_xxxxx
  &type=signup
  &redirect_to=http://localhost:3000   ← ここが本番URLになっていない
```

原因は 2 つ重なっていました。

### 原因1: アプリが戻り先を指定していなかった

`signUp()` に `emailRedirectTo` を渡していませんでした。
未指定の場合、Supabase は**ダッシュボードの Site URL** を戻り先に使います。
その Site URL がローカル開発時の `http://localhost:3000` のままだった、というのが直接の原因です。

### 原因2: 戻り先には許可リストがある

ここが分かりにくいところですが、`emailRedirectTo` を指定しても**それだけでは足りません**。
Supabase は受け取った戻り先を **Redirect URLs（許可リスト）** と照合し、
**一致しなければ黙って Site URL にフォールバックします**。

```
emailRedirectTo が Redirect URLs に載っている → その URL を使う
載っていない                                  → Site URL を使う（エラーにはならない）
```

これは、攻撃者が `emailRedirectTo=https://evil.example.com` を指定して
確認リンクを自分のサイトに向けさせる**オープンリダイレクト**を防ぐための仕組みです。
親切心でエラーを出してくれないので、「コードは直したのに直らない」という状況になりがちです。

### 結論として必要だった設定

| 場所 | 設定 |
|------|------|
| Supabase ダッシュボード | Site URL を本番 URL に |
| Supabase ダッシュボード | Redirect URLs に `https://<本番ドメイン>/auth/callback` を追加 |
| ホスティングの環境変数 | `NEXT_PUBLIC_SITE_URL=https://<本番ドメイン>` |

**Site URL を直すだけでも不具合は解消します。** コード側の対応は、そのうえで
「リンクを踏んだらログイン状態で入れる」「戻り先をダッシュボード設定に依存させない」
「無効なリンクに案内を出す」を足すためのものです。

---

## 4. PKCE：なぜ「コード」を「セッション」に交換するのか

リンクに付いてくる `pkce_...` や、戻り先に付く `?code=...` は**セッションそのものではありません**。
セッションと引き換えるための、1 回だけ使える引換券です。

なぜ直接セッションを渡さないのか。URL は思っている以上に漏れるからです。

- メールを別の人に転送する / 共有PCのメールアプリに残る
- ブラウザの履歴、ブックマーク、拡張機能
- 企業のプロキシやセキュリティ製品のアクセスログ
- リンク先ページから外部リソースを読むときの Referer ヘッダー

もし URL にアクセストークンが直接載っていたら、これらのどれか 1 つでも漏れた時点で
その人としてログインできてしまいます。

PKCE では次のように役割を分けます。

| もの | どこにあるか | 誰が持っているか |
|------|-------------|-----------------|
| `code`（引換券） | URL の中 | 漏れる可能性がある |
| `code_verifier`（合鍵） | 登録した**ブラウザの Cookie** | そのブラウザだけ |

セッションを受け取るには **両方** が必要です。
つまり URL を盗み見ただけの第三者は、合鍵がないのでセッションに交換できません。

そして合鍵はブラウザの Cookie にあるので、交換処理は
**そのブラウザからのリクエストを受け取ったサーバー側**で実行する必要があります。
これが `/auth/callback` を Route Handler として置いている理由です。

> `code` は 1 回使うと無効になり、期限もあります（ローカル設定では `otp_expiry = 3600` で 1 時間）。

---

## 5. セッションはどこに保存され、どう検証されているか

`@supabase/ssr` はセッションを **Cookie** に保存します。
サーバーコンポーネントや Server Action からは `src/lib/supabase/server.ts` の
`createClient()` 経由で読み書きします。

重要なのは、Cookie の中身を**信用しきらない**ことです。
Cookie はユーザーの手元にあるので、理屈のうえでは書き換えられます。
そのため `src/proxy.ts` では毎リクエスト `getUser()` を呼んでいます。

| メソッド | 挙動 | 用途 |
|---------|------|------|
| `getSession()` | Cookie の中身をそのまま読む（サーバーに問い合わせない） | 速いが改ざん検知はできない |
| `getUser()` | Supabase Auth に問い合わせてトークンを検証する | 認可の判断に使う |

`server.ts` の `createAuthedClient()` が `getUser()` を使っているのも同じ理由です。
「ログインしているか」をコードで判断する場所では、必ず `getUser()` 側を使ってください。

> Cookie の属性（HttpOnly / Secure / SameSite）は `createServerClient` の `cookieOptions` で
> 指定できます。現状は Supabase 側が渡す既定値のままです。

---

## 6. コードの解説

### 6-1. `src/constants/auth.ts`

パスを定数にまとめています。`/auth/callback` は
「サインアップ時に Supabase へ伝える値」「Route Handler の実体」「proxy の公開パス」の
3 か所に登場するので、文字列を散らすとズレたときに気づけません。

### 6-2. `src/lib/site-url.ts`

確認メールに載せる絶対 URL のベース（オリジン）を決めます。

```ts
export async function getSiteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) { /* ... 正規化して返す ... */ }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  // ...
}
```

**なぜ環境変数を最優先するのか。**
確認メールは、送信した瞬間のリクエストとはまったく別のタイミング・別の端末で開かれます。
「今アクセスしてきているホスト」を戻り先にするのは、本来筋が悪い決め方です。
本番は環境変数で固定するのが正解で、ホストからの組み立ては
ローカル開発を楽にするためのフォールバックだと考えてください。

**`x-forwarded-host` とは。**
Vercel のようなホスティングでは、リクエストは一度プロキシを通ってからアプリに届きます。
このとき `host` ヘッダーは内部のホスト名になっていることがあり、
ユーザーが実際にアクセスしたドメインは `x-forwarded-host` に入ります。

**セキュリティ上の注意。**
`host` も `x-forwarded-host` も、**リクエストを送る側が自由に書ける値**です。
これを信じて絶対 URL を組み立てる手法は Host header injection と呼ばれる攻撃の入口になり得ます。
このアプリでは、仮に偽のホストを送り込まれても

1. 本番は `NEXT_PUBLIC_SITE_URL` が設定されているのでヘッダーを見ない
2. 万一ヘッダーを見ても、Supabase の Redirect URLs に載っていない URL は使われない

という二段構えになっています。**本番で環境変数を設定することが、この防御の 1 段目**です。

### 6-3. `src/infrastructure/repositories/auth-repository-impl.ts`

```ts
await supabase.auth.signUp({
  email: input.email,
  password: input.password,
  options: {
    emailRedirectTo: `${origin}${AUTH_CALLBACK_PATH}`,
  },
});
```

戻り先を明示するだけの変更です。ここで作った URL が、そのまま
Supabase の Redirect URLs と照合されます。照合はワイルドカード（`*` / `**`）を使えるので、
`https://<本番ドメイン>/**` のようにまとめて登録することも、
`https://<本番ドメイン>/auth/callback` と明示することもできます。
ワイルドカードを使わない場合は**パスまで含めて一致**している必要があります。

### 6-4. `src/app/auth/callback/route.ts`

やっていることは 3 つです。

**(1) `code` をセッションに交換する**

```ts
const { error } = await supabase.auth.exchangeCodeForSession(code);
```

前述の合鍵（Cookie 内の `code_verifier`）と組み合わせてセッションを取得します。

**(2) `token_hash` 形式にも対応する**

Supabase のメールテンプレートを `{{ .TokenHash }}` を使う形に変えると、
`code` ではなく `token_hash` と `type` が付いて戻ってきます。
その場合は `verifyOtp()` で検証します。テンプレート変更で壊れないよう両対応にしています。

**(3) `next` の行き先を検証する**

```ts
if (!value || !value.startsWith("/") || value.startsWith("//")) {
  return AUTH_CALLBACK_SUCCESS_PATH;
}
```

`/auth/callback?next=/recipe/new` のように遷移先を指定できますが、
このクエリは URL に書いてある値、つまり**誰でも書き換えられる値**です。

`//evil.example.com` という書き方は**プロトコル相対 URL**といって、
ブラウザは `https://evil.example.com` として解釈します。
検証なしで `redirect()` に渡すと、自サイトのドメインから任意の外部サイトへ飛ばせる
オープンリダイレクトになり、フィッシングに使われます。
そこで「`/` で始まり、`//` では始まらない」パスだけを通しています。

### 6-5. `src/proxy.ts`

```ts
const PUBLIC_PATHS = [ /* ... */ AUTH_CALLBACK_PATH, /* ... */ ];
```

`/auth/callback` はセッションが**まだ無い**状態で到達します。
公開パスに入れないと、セッションを作る前にログイン画面へ弾かれて永久に完了しません。

公開にして危なくないのか、という点については、このルートは
「Supabase が発行した正当な `code` または `token_hash` を持っている場合だけ」
セッションを作ります。何も持たずにアクセスしても `/login?authError=1` に戻るだけです。

### 6-6. `src/app/(auth)/login/page.tsx`

`?authError=1` が付いていたら「確認リンクが無効か、有効期限が切れています」と表示します。
失敗を黙って握りつぶさないための導線です。

---

## 7. ローカルでの確認方法

ローカルの Supabase は**メールを実際には送りません**。代わりに Inbucket という
テスト用メールサーバーが受け取り、ブラウザで中身を確認できます。

1. `supabase start` でローカル環境を起動する
2. `npm run dev` でアプリを起動する
3. `http://localhost:3000/signup` から適当なメールアドレスで登録する
4. `http://127.0.0.1:54324` を開く（Inbucket の画面。ポートは `supabase/config.toml` の `[inbucket]`）
5. 届いたメールのリンクをクリックする
6. `/top` にログイン状態で遷移すれば成功

戻り先の許可リストは `supabase/config.toml` の `[auth]` に書いてあります。
本番のダッシュボード設定と同じ役割です。

```toml
site_url = "http://localhost:3000"
additional_redirect_urls = [
  "http://localhost:3000/auth/callback",
  "http://127.0.0.1:3000/auth/callback",
]
```

---

## 8. つまずきやすいポイント

| 症状 | 原因として多いもの |
|------|------------------|
| リンクが localhost のまま | ダッシュボードの Site URL が本番 URL になっていない |
| `emailRedirectTo` を指定したのに無視される | Redirect URLs に登録されていない（ワイルドカードを使わない場合は末尾スラッシュ違いも不一致） |
| リンクを踏むと `/login?authError=1` に飛ぶ | リンクの期限切れ、または既に 1 回使用済み |
| 2 回目にリンクを踏むと失敗する | 引換券は 1 回限り。仕様どおりの挙動 |
| メールを開いただけで無効になる | メールソフトやセキュリティ製品がリンクを先読みして消費することがある |
| ローカルでメールが届かない | 実際には送信されない。Inbucket（`http://127.0.0.1:54324`）を見る |

---

## 9. Supabase に任せている部分と、自分で守る部分

Supabase を使うと認証の難しい部分は肩代わりしてもらえますが、**丸投げにはなりません**。
どこまでが任せられて、どこからが自分の責任かを整理しておきます。

| 項目 | 誰の責任か |
|------|-----------|
| パスワードのハッシュ化・保管 | Supabase |
| 確認トークンの生成・期限・使い捨て | Supabase |
| アクセストークン（JWT）の署名と検証 | Supabase |
| 戻り先 URL の許可リスト照合 | Supabase（ただし**登録するのは自分**） |
| どのパスを未ログインで公開するか | 自分（`src/proxy.ts`） |
| 誰がどのデータを読めるか | 自分（Postgres の RLS。[ADR 06](../adr/06-rls-helper-functions.md)） |
| `next` などクエリ経由の遷移先の検証 | 自分 |
| 環境変数（本番 URL、キー）の管理 | 自分 |

「認証（誰か）」は Supabase が見てくれますが、
**「認可（何をしてよいか）」は RLS と `proxy.ts` で自分が書いている**、という切り分けを
押さえておくと、どこを疑えばいいか分かりやすくなります。

---

## 10. 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/constants/auth.ts` | コールバックのパスと遷移先の定数 |
| `src/lib/site-url.ts` | 絶対 URL のベースを解決 |
| `src/infrastructure/repositories/auth-repository-impl.ts` | `signUp` に `emailRedirectTo` を渡す |
| `src/app/auth/callback/route.ts` | `code` / `token_hash` を検証してセッションを確立 |
| `src/proxy.ts` | 公開パスの管理 |
| `src/app/(auth)/login/page.tsx` | リンク無効時の案内表示 |
| `supabase/config.toml` | ローカルの Site URL / Redirect URLs / メール設定 |
