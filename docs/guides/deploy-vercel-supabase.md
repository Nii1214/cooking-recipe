# Vercel + Supabase 本番デプロイ手順

## 公開 URL

| 環境 | URL | 備考 |
|------|-----|------|
| **本番（Vercel Production）** | [https://cooking-recipe-liard.vercel.app/](https://cooking-recipe-liard.vercel.app/) | README にも掲載 |

## 概要

| 環境 | Git ブランチ | ホスティング | BaaS |
|------|-------------|-------------|------|
| **本番** | `main` | Vercel Production | Supabase Cloud（本番プロジェクト） |
| **検証** | `develop` | Vercel Preview | Supabase Cloud（検証プロジェクト推奨） |

本番デプロイは **Supabase 側の DB・Auth 設定 → Vercel 側のアプリデプロイ** の順で行います。

---

## 前提条件

- [Vercel](https://vercel.com) アカウント
- [Supabase](https://supabase.com) アカウント
- [AWS](https://aws.amazon.com) アカウント（レシピサムネイル用 S3。未設定でも他機能は動作）
- GitHub リポジトリへのアクセス権
- ローカルに Supabase CLI（`npm install` で devDependencies に含まれる）

---

## 1. Supabase Cloud プロジェクトを作成

1. [Supabase Dashboard](https://supabase.com/dashboard) → **New project**
2. リージョンは **Tokyo (ap-northeast-1)** 推奨（Vercel 東京リージョンと近い）
3. DB パスワードを安全に保管

### 1-1. マイグレーションを適用

ローカルでプロジェクトをリンクし、`supabase/migrations/` をリモート DB に反映します。

```bash
# Supabase CLI にログイン
npx supabase login

# プロジェクトをリンク（Project ID は Dashboard → Settings → General）
npx supabase link --project-ref <your-project-ref>

# マイグレーションを本番 DB に push
npx supabase db push
```

> **確認**: Dashboard → **Table Editor** で `profiles`, `families`, `recipes` 等が存在すること。

### 1-2. Auth 設定

Dashboard → **Authentication** → **URL Configuration**

| 項目 | 本番例 |
|------|--------|
| **Site URL** | `https://cooking-recipe-liard.vercel.app` |
| **Redirect URLs** | `https://cooking-recipe-liard.vercel.app/**` |

Preview 環境（`develop` ブランチ）も使う場合は、Vercel Preview URL も追加します。

```
https://*-your-team.vercel.app/**
```

#### ゲストログイン（Anonymous Sign-Ins）

ゲストログイン機能を使う場合は、**必ず** Anonymous Sign-Ins を有効にします。

| 環境 | 手順 |
|------|------|
| **Supabase Cloud（本番・Preview）** | Dashboard → **Authentication** → **Providers** → **Anonymous** → **Enable anonymous sign-ins** を ON |
| **CLI で設定を同期** | リポジトリの `supabase/config.toml` は `enable_anonymous_sign_ins = true` 済み。リンク済みなら `npx supabase config push` でも反映可能 |
| **ローカル（Supabase CLI）** | `config.toml` 変更後は **`npx supabase stop && npx supabase start`** が必要（起動中のままでは反映されない） |

> **よくある症状**: LP やログイン画面で「ゲストログインは現在利用できません」と表示される → 上記が未設定、またはローカル Supabase を再起動していない。

### 1-3. API キーを控える

Dashboard → **Project Settings** → **API**

| キー | 用途 | Vercel 設定 |
|------|------|------------|
| **Project URL** | Supabase API エンドポイント | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon public** | クライアント・Server Actions | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

> `service_role` キーは RLS をバイパスするため、**Vercel に設定しない**（本アプリは未使用）。

---

## 2. AWS S3（サムネイル用・任意）

レシピサムネイルのアップロードに使用します。未設定の場合、一覧・詳細は動きますがアップロードは失敗します。

1. S3 バケットを作成（例: `cooking-recipe-thumbnails-prod`）
2. IAM ユーザーを作成し、当該バケットへの `PutObject` / `GetObject` 権限を付与
3. アクセスキーを発行

Vercel に以下を設定:

| 変数名 | 例 |
|--------|-----|
| `AWS_REGION` | `ap-northeast-1` |
| `AWS_S3_BUCKET_NAME` | `cooking-recipe-thumbnails-prod` |
| `AWS_ACCESS_KEY_ID` | （IAM ユーザーのキー） |
| `AWS_SECRET_ACCESS_KEY` | （IAM ユーザーのシークレット） |

---

## 3. Vercel にデプロイ

### 3-1. プロジェクトをインポート

1. [Vercel Dashboard](https://vercel.com/dashboard) → **Add New** → **Project**
2. GitHub リポジトリ `cooking-recipe` を選択
3. Framework Preset: **Next.js**（自動検出）
4. **Production Branch**: `main`（Git Flow に合わせる）

### 3-2. 環境変数

**Settings** → **Environment Variables** に追加:

| 変数 | Production | Preview | Development |
|------|:----------:|:-------:|:-------------:|
| `NEXT_PUBLIC_SUPABASE_URL` | o | o | o |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | o | o | o |
| `AWS_REGION` | o | o | - |
| `AWS_S3_BUCKET_NAME` | o | o | - |
| `AWS_ACCESS_KEY_ID` | o | o | - |
| `AWS_SECRET_ACCESS_KEY` | o | o | - |

- **Production** … `main` マージ時
- **Preview** … `develop` や PR ごとのプレビュー URL

テンプレートはリポジトリルートの [`.env.example`](../../.env.example) を参照。

### 3-3. ビルド設定（デフォルトで OK）

| 項目 | 値 |
|------|-----|
| Build Command | `npm run build` |
| Output Directory | （Next.js デフォルト） |
| Install Command | `npm install` |
| Node.js Version | 20.x（`package.json` の `engines` 参照） |

### 3-4. 初回デプロイ

1. `main` ブランチを Production としてデプロイ  
   または `develop` を Preview として確認
2. デプロイ URL を Supabase Auth の Site URL / Redirect URLs に反映（未設定の場合）

---

## 4. デプロイ後チェックリスト

公開 URL: [https://cooking-recipe-liard.vercel.app/](https://cooking-recipe-liard.vercel.app/)

- [ ] ランディングページ（`/`）が表示される
- [ ] 未ログインで保護ルート → `/login` へリダイレクト
- [ ] 新規登録 → メール確認 → ログイン
- [ ] プロフィール作成（`/profile/new`）
- [ ] 家族グループ作成（`/family`）
- [ ] レシピ登録・一覧・検索
- [ ] （S3 設定済みの場合）サムネイルアップロード

---

## 5. 運用フロー（Git Flow との連携）

```
feature/* → develop（Preview デプロイ）→ main（Production デプロイ）
```

| タイミング | Git | Vercel | Supabase |
|-----------|-----|--------|----------|
| 機能開発 | `feature/*` PR → `develop` | Preview URL で確認 | 検証プロジェクトに `db push` |
| 本番リリース | `develop` → `main` PR マージ | Production 再デプロイ | 本番プロジェクトに `db push`（スキーマ変更時） |

**DB スキーマ変更時**は、Vercel デプロイ**前に**対象 Supabase プロジェクトへ `npx supabase db push` を実行してください。

---

## 6. トラブルシューティング

### `Could not find the table 'public.profiles' in the schema cache`

マイグレーション未適用です。

```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

### ログイン後にすぐログアウト / セッションが維持されない

- Vercel の `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` が正しいか確認
- Supabase Auth の Site URL が Vercel の URL と一致しているか確認

### メール確認リンクが localhost を指す

Supabase Dashboard → Auth → URL Configuration の **Site URL** を本番 URL に更新。

### 「ゲストログインは現在利用できません」と表示される

LP・ログイン画面どちらでも同じ Server Action を使うため、**LP 固有の不具合ではありません**。

| 環境 | 対処 |
|------|------|
| **ローカル** | `npm run supabase:restart`（`config.toml` の Anonymous 設定を反映） |
| **Supabase Cloud** | Dashboard → Authentication → Providers → **Anonymous** を ON |

### ビルド失敗

```bash
npm run build
npm run lint
npm run test:run
```

をローカルで通してから push。

---

## 関連ドキュメント

- [Supabase ローカル開発](./supabase-local-dev-with-docker.md)
- [Git ブランチ運用](./git-branch-workflow.md)
- [ADR: Vercel](../adr/03-Vercel.md)
- [環境変数テンプレート](../../.env.example)
