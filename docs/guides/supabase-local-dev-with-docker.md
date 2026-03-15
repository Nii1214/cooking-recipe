# Supabase ローカル開発環境の構築（Docker 利用）

## 概要

Supabase CLI は Docker を使ってローカルに Supabase スタック全体を立ち上げます。
本プロジェクトでは `supabase` CLI がすでに devDependencies に含まれているため、
追加インストールは不要です。

---

## 前提条件

| 項目                                                              | 備考                                                   |
| ----------------------------------------------------------------- | ------------------------------------------------------ |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | macOS では Desktop 版が必要。起動しておくこと          |
| Node.js / npm                                                     | 本プロジェクトの依存関係で管理済み                     |
| Supabase CLI                                                      | `devDependencies` に `supabase@^2.72.8` として含まれる |

---

## ディレクトリ構成（初期化後）

`supabase init` を実行するとプロジェクトルートに以下が生成されます。

```
cooking-recipe/
├── supabase/
│   ├── config.toml          # ローカル Supabase の設定ファイル
│   ├── seed.sql             # 初期データ投入用 SQL（任意）
│   └── migrations/          # スキーマ変更の履歴（マイグレーションファイル）
│       └── YYYYMMDDHHMMSS_init.sql
├── .env.local               # Next.js が読み込む環境変数（git 管理外）
└── ...
```

---

## セットアップ手順

### 1. Supabase プロジェクトを初期化する

```bash
npx supabase init
```

`supabase/config.toml` が生成されます。
すでに存在する場合はスキップしてください。

---

### 2. Docker Desktop を起動する

Supabase のローカルスタックは Docker コンテナで動作します。
コマンドを実行する前に Docker Desktop が起動していることを確認してください。

---

### 3. ローカル Supabase を起動する

```bash
npx supabase start
```

初回は Docker イメージのプル（数分）が発生します。
起動後、以下のような出力が得られます。

```
API URL:      http://127.0.0.1:54321
GraphQL URL:  http://127.0.0.1:54321/graphql/v1
DB URL:       postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL:   http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324  ← メール送信のモック画面
anon key:     eyJhbGci...（ローカル用の公開キー）
service_role key: eyJhbGci...（ローカル用のサービスキー。外部に漏らさない）
```

---

### 4. 環境変数を設定する（`.env.local`）

プロジェクトルートに `.env.local` を作成し、`supabase start` の出力値を貼り付けます。

```env
# .env.local（git 管理外 ― .gitignore に含まれていることを確認）

NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<上記の anon key>

# サーバーサイドのみで使用する場合（Server Actions / API Routes）
SUPABASE_SERVICE_ROLE_KEY=<上記の service_role key>
```

> **注意**: `service_role key` はすべての RLS（Row Level Security）をバイパスするため、
> クライアント側のコードには絶対に公開しないでください。

`.gitignore` に `.env.local` が含まれていない場合は必ず追加してください。

```gitignore
# .gitignore
.env.local
.env*.local
```

---

### 5. Supabase Studio でスキーマを確認する

ブラウザで `http://127.0.0.1:54323` を開くと、
ローカル DB の管理 UI（Supabase Studio）が利用できます。
テーブル確認・SQL 実行・ユーザー管理などが可能です。

---

## 主要コマンド一覧

| コマンド                                    | 説明                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `npx supabase start`                        | ローカルスタックを起動                                                       |
| `npx supabase stop`                         | ローカルスタックを停止（コンテナは残る）                                     |
| `npx supabase stop --no-backup`             | 停止してコンテナも削除                                                       |
| `npx supabase status`                       | 起動中の URL / キーを再表示                                                  |
| `npx supabase migration new <名前>`         | 新しいマイグレーションファイルを作成                                         |
| `npx supabase migration up --local`         | **未適用のマイグレーションだけ**をローカル DB に適用する（既存データは残る） |
| `npx supabase db push`                      | ローカルのマイグレーションをリモートに適用                                   |
| `npx supabase gen types typescript --local` | ローカル DB から TypeScript 型を生成                                         |

| コマンド                | 説明                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `npx supabase db reset` | **⚠️ 既存データをすべて削除したうえで** DB を初期化し、`migrations/` と `seed.sql` を再適用する。データを残したい場合は使わないこと。 |

---

## マイグレーション管理

### 新しいテーブルを追加する例

```bash
# マイグレーションファイルを作成
npx supabase migration new create_recipes_table
```

生成された `supabase/migrations/YYYYMMDDHHMMSS_create_recipes_table.sql` を編集します。

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_create_recipes_table.sql

create table recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz default now() not null
);

-- RLS を有効化
alter table recipes enable row level security;

-- 認証済みユーザーのみ読み取りを許可する例
create policy "authenticated users can read recipes"
  on recipes for select
  using (auth.role() = 'authenticated');
```

#### 新しいマイグレーションを適用する

**既存のローカルデータを残したまま**、未適用のマイグレーションだけを反映するには、ローカルで Supabase を起動した状態で次を実行します。

```bash
npx supabase migration up --local
```

未適用のマイグレーションが順に実行され、既存データはそのまま残ります。  
（参考: [Supabase 公式 — Local development](https://supabase.com/docs/guides/cli/local-development)）

#### db reset について（データが消える）

`npx supabase db reset` は **DB をいったん作り直し、全マイグレーションを最初からやり直す**コマンドです。  
**既存のデータ（ユーザー・レシピなど）はすべて削除されます。**

- **使う場面**: ローカルを「まっさらな状態」からやり直したいときだけ使う。
- **データを残したいとき**: 上記「新しいマイグレーションを適用する（データを残す）」の方法を使い、`db reset` は実行しないこと。

---

## TypeScript 型の自動生成

ローカル DB のスキーマから TypeScript の型定義を生成できます。

```bash
npx supabase gen types typescript --local > src/types/supabase.ts
```

生成された型はリポジトリやインフラ層で利用できます。

```ts
// src/types/supabase.ts が生成された後の利用例
import type { Database } from '@/types/supabase'

type RecipeRow = Database['public']['Tables']['recipes']['Row']
```

---

## npm scripts への追加（推奨）

`package.json` に以下のスクリプトを追加しておくと便利です。

```json
{
  "scripts": {
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:migrate": "supabase migration up --local",
    "supabase:types": "supabase gen types typescript --local > src/types/supabase.ts"
  }
}
```

- **`supabase:migrate`** … 未適用のマイグレーションだけをローカルに適用します（データは残ります）。新しいマイグレーションを追加したあとに実行してください。
- **`db reset` について** … データをすべて消して DB を初期化したい場合のみ、手動で `npx supabase db reset` を実行してください。通常の開発では `supabase:migrate` を使い、`db reset` は使わないことを推奨します。

---

## セキュリティ上の注意点

- `.env.local` は **絶対に git にコミットしない**
- `service_role key` は `NEXT_PUBLIC_` プレフィックスをつけず、サーバーサイドのみで使用する
- RLS（Row Level Security）を全テーブルで有効化し、ポリシーで適切なアクセス制御を行う
- 本番環境の接続情報（URL・キー）はローカル開発環境とは別に管理する

---

## トラブルシューティング

### `supabase start` でエラーが出る場合

- Docker Desktop が起動しているか確認する
- `npx supabase stop --no-backup` でコンテナを完全に削除してから再度 `start` を試みる
- Docker のリソース設定（メモリ 4GB 以上推奨）を確認する

### ポートが競合する場合

`supabase/config.toml` の `[api]`・`[db]`・`[studio]` セクションでポート番号を変更できます。

```toml
[api]
port = 54321

[db]
port = 54322

[studio]
port = 54323
```

### メール認証のテスト

ローカルでは Inbucket（`http://127.0.0.1:54324`）がメールをキャッチします。
実際には送信されないため、確認メールのリンクを Inbucket から確認してください。

---

## よくある質問（Q&A）

### Q1. `NEXT_PUBLIC_SUPABASE_ANON_KEY` に何を入れればよいか

**A.** URL ではなく、`npx supabase start`（または `npx supabase status`）を実行したときに出力される JWT トークン文字列を設定します。

```env
# 誤り（URL を入れてしまっている）
NEXT_PUBLIC_SUPABASE_ANON_KEY=http://127.0.0.1:54321

# 正しい（eyJ... から始まる JWT トークン）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

ローカル Supabase の `anon key` は起動のたびに変わらず固定値です。

---

### Q2. Supabase の画面に `anon key` という表記が見当たらない

**A.** Supabase は UI の表記を変更しており、現在は以下の名称になっています。

| 旧表記             | 新表記              | 用途                                                                  |
| ------------------ | ------------------- | --------------------------------------------------------------------- |
| `anon key`         | **Publishable key** | クライアント側で使用可。`NEXT_PUBLIC_SUPABASE_ANON_KEY` に設定する    |
| `service_role key` | **Secret key**      | サーバー側専用。`NEXT_PUBLIC_` をつけず、絶対にクライアントに渡さない |

---

### Q3. ユーザー登録後、Inbucket（`http://127.0.0.1:54324`）に確認メールが届かない

**A.** `supabase/config.toml` の `enable_confirmations` が `false` になっているため、確認メール自体が送信されていません。

```toml
[auth.email]
enable_confirmations = false  # ← false のままだとメールは送られず即座にサインアップ完了
```

確認メールフローを実装・テストしたい場合は `true` に変更し、Supabase を再起動してください。

```toml
[auth.email]
enable_confirmations = true
```

```bash
npx supabase stop
npx supabase start
```

| 設定値                | 挙動                                                         |
| --------------------- | ------------------------------------------------------------ |
| `false`（デフォルト） | メール確認なしで即座にサインアップ完了。開発初期に便利       |
| `true`                | 確認メールが Inbucket に届く。本番に近いフローをテストできる |
