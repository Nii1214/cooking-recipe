# ゲストユーザー削除バッチ — 運用手順書

関連: [実装スコープ](../implementation/guest/guest-cleanup-batch.md) / [ADR 007](../adr/07-guest-login.md)

## このバッチは何をするか

| 項目 | 内容 |
|------|------|
| **目的** | ゲスト（匿名）ログインユーザーとその関連データを削除する |
| **対象** | `auth.users.is_anonymous = true` の全ユーザー |
| **削除の連鎖** | `auth.users` 削除 → FK CASCADE で `profiles` / `recipes` / `families` 等も削除 |
| **対象外** | メール登録済みユーザー（`is_anonymous = false`） |

---

## 全体像（どこで動くか）

```
┌─────────────────────┐   6時間おき（自動）    ┌──────────────────────────────┐
│  Supabase pg_cron   │ ─────────────────────► │  cleanup_anonymous_users()   │
│  （スケジューラ）     │   または手動 SQL 実行   │  （PostgreSQL 関数）          │
└─────────────────────┘                        └──────────────┬───────────────┘
                                                              │
                                                              ▼
                                               DELETE FROM auth.users
                                               WHERE is_anonymous = true
                                                              │
                                                              ▼
                                               profiles / recipes / families … CASCADE
```

| 役割 | 担当 | 説明 |
|------|------|------|
| **スケジューラ** | **Supabase pg_cron** | 6 時間おきに SQL 関数を実行 |
| **削除ロジック** | **PostgreSQL 関数** | `public.cleanup_anonymous_users()` |
| **Vercel / Next.js** | **関与しない** | API Route も Cron も `service_role` も不要 |

> **方針**: `service_role` は使わない。バッチは Supabase 内で完結する（ADR 007 の「DB 関数 + Cron」）。

---

## 本番環境で必要な設定

### Vercel 側

**追加設定は不要です。**

| 以前（Vercel バッチ） | 現在（Supabase バッチ） |
|----------------------|------------------------|
| `SUPABASE_SERVICE_ROLE_KEY` | 不要 |
| `CRON_SECRET` | 不要 |
| `vercel.json` crons | 不要 |

ゲストログイン用の `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` だけで OK です。

### Supabase 側（本番・必須）

マイグレーションを本番 DB に適用します。

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

これにより以下が作成されます（`supabase/migrations/20260801000001_guest_cleanup_pg_cron.sql`）:

| オブジェクト | 内容 |
|-------------|------|
| `pg_cron` 拡張 | スケジューラ |
| `public.cleanup_anonymous_users()` | 匿名ユーザー削除関数 |
| Cron ジョブ `cleanup-anonymous-users` | 6 時間おき実行 |

### 本番セットアップ後の確認

1. Supabase Dashboard → **Integrations** → **Cron Jobs**
   - ジョブ名 `cleanup-anonymous-users` が **Active** であること
2. Dashboard → **SQL Editor** で手動実行（初回確認）:
   ```sql
   SELECT public.cleanup_anonymous_users();
   ```
3. レスポンス例:
   ```json
   {"success": true, "deletedCount": 0}
   ```

---

## 実行方法

### 方法 A: 手動実行（SQL Editor）

初回確認・障害時・テスト向け。**最も確実な方法**です。

#### 本番（Supabase Cloud）

1. [Supabase Dashboard](https://supabase.com/dashboard) → 対象プロジェクト
2. **SQL Editor** → New query
3. 実行:
   ```sql
   SELECT public.cleanup_anonymous_users();
   ```

#### ローカル（Supabase CLI + Docker）

1. `npx supabase start` でローカル DB が起動していること
2. ブラウザで **Studio** を開く: `http://127.0.0.1:54323`
3. **SQL Editor** → 同じ SQL を実行

または psql:

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  -c "SELECT public.cleanup_anonymous_users();"
```

### 方法 B: 定期実行（pg_cron・自動）

マイグレーション適用後、**追加作業なし**で 6 時間おきに自動実行されます。

| 項目 | 値 |
|------|-----|
| ジョブ名 | `cleanup-anonymous-users` |
| Cron 式 | `0 */6 * * *`（UTC） |

**日本時間の実行タイミング**

| UTC | JST |
|-----|-----|
| 00:00 | 09:00 |
| 06:00 | 15:00 |
| 12:00 | 21:00 |
| 18:00 | 03:00（翌日） |

#### Cron ジョブの確認

```sql
SELECT jobid, jobname, schedule, active
FROM cron.job
WHERE jobname = 'cleanup-anonymous-users';
```

#### 実行履歴の確認

```sql
SELECT jobid, status, return_message, start_time, end_time
FROM cron.job_run_details
WHERE jobid = (
  SELECT jobid FROM cron.job WHERE jobname = 'cleanup-anonymous-users'
)
ORDER BY start_time DESC
LIMIT 10;
```

---

## ローカルでのテスト方法

**ローカルでもテストできます。** Vercel や `service_role` は不要です。

### 前提

- Docker Desktop 起動済み
- `npx supabase start` 済み
- マイグレーション適用済み（`db reset` または `migration up`）
- `.env.local` に anon キー設定済み
- `npm run dev` でアプリ起動可能

### 手順 1: マイグレーションを適用

```bash
# 初回 or マイグレーション追加後
npx supabase db reset
# または
npx supabase migration up
```

> `db reset` は DB を初期化して全マイグレーションを再適用します。既存ローカルデータは消えます。

### 手順 2: テスト用ゲストを作る

1. `npm run dev`
2. ブラウザで `http://localhost:3000/login`
3. **「ゲストで試す」** をクリック
4. プロフィール作成まで進める（任意）

> ローカルで Anonymous Sign-In が有効でない場合: `npm run supabase:restart`

### 手順 3: ゲストが存在することを確認

**Supabase Studio**（`http://127.0.0.1:54323`）→ **Authentication** → **Users**

- Anonymous ユーザーが 1 件以上いること

または SQL:

```sql
SELECT id, is_anonymous, created_at
FROM auth.users
WHERE is_anonymous = true;
```

### 手順 4: バッチを手動実行

Studio → **SQL Editor**:

```sql
SELECT public.cleanup_anonymous_users();
```

**期待結果:**

```json
{"success": true, "deletedCount": 1}
```

（ゲスト数に応じて `deletedCount` は変わります）

### 手順 5: 削除を確認

1. **Authentication** → Anonymous ユーザーが消えている
2. **Table Editor** → `profiles` 等も CASCADE で削除されている（作成済みの場合）
3. アプリでゲストセッションが無効になっていること

### 手順 6（任意）: pg_cron の自動実行を確認

ローカル Supabase でも pg_cron は動作します。6 時間待たずに確認する場合は **手順 4 の手動 SQL** で十分です。

Cron ジョブが登録されているか:

```sql
SELECT * FROM cron.job WHERE jobname = 'cleanup-anonymous-users';
```

---

## ローカル vs 本番 比較

| 項目 | ローカル | 本番（Supabase Cloud） |
|------|---------|----------------------|
| マイグレーション適用 | `npx supabase db reset` | `npx supabase db push` |
| 手動実行 | Studio SQL Editor（`:54323`） | Dashboard SQL Editor |
| 定期実行 | pg_cron（マイグレーション適用後） | pg_cron（`db push` 後） |
| Vercel 設定 | 不要 | 不要 |
| `service_role` | 不要 | 不要 |
| ゲスト作成 | `localhost:3000` でゲストログイン | 本番 URL でゲストログイン |

---

## レスポンスの見方

**成功（削除対象なし）**

```json
{"success": true, "deletedCount": 0}
```

**成功（ゲストを削除）**

```json
{"success": true, "deletedCount": 3}
```

**失敗**

```json
{"success": false, "error": "..."}
```

---

## トラブルシューティング

### `function public.cleanup_anonymous_users() does not exist`

マイグレーション未適用です。

```bash
# ローカル
npx supabase db reset

# 本番
npx supabase db push
```

### 削除は成功したが profiles が残る

`families.owner_id` CASCADE マイグレーション未適用の可能性。

```bash
npx supabase db push
```

### ローカルでゲストログインできない

```bash
npm run supabase:restart
```

Anonymous Sign-Ins が `supabase/config.toml` で有効か確認。

### Cron ジョブが Dashboard にない

1. `npx supabase db push`（本番）または `db reset`（ローカル）が成功しているか
2. SQL で確認:
   ```sql
   SELECT * FROM cron.job;
   ```

### pg_cron 拡張エラー（マイグレーション時）

ローカル CLI を最新にして DB を再起動:

```bash
npx supabase stop --no-backup
npx supabase start
npx supabase db reset
```

---

## よくある質問

### Q. Vercel にデプロイする必要はある？

**A.** バッチ自体は **Supabase だけ** で動きます。ただしゲストログイン UI は Vercel 上のアプリなので、ゲスト機能全体としては Vercel デプロイも必要です。バッチ用の追加デプロイ設定はありません。

### Q. `service_role` は必要？

**A.** **不要です。** 削除は DB 内の `SECURITY DEFINER` 関数 + pg_cron で行います。

### Q. develop 用 Supabase が無くてもテストできる？

**A.** はい。**ローカル Supabase**（Docker）で手順 1〜5 のテストができます。本番確認は `db push` 後に Dashboard SQL Editor で行います。

### Q. スケジュールを変えたい

**A.** マイグレーションの `cron.schedule` を変更するか、Dashboard / SQL で更新:

```sql
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-anonymous-users'),
  schedule := '0 0 * * *'  -- 例: 1日1回 UTC 0時
);
```

---

## 関連ドキュメント

- [Supabase ローカル開発](./supabase-local-dev-with-docker.md)
- [Vercel + Supabase 本番デプロイ](./deploy-vercel-supabase.md)
- [ゲストユーザー削除バッチ — 実装スコープ](../implementation/guest/guest-cleanup-batch.md)
- [ADR 007: ゲストユーザーログイン](../adr/07-guest-login.md)
