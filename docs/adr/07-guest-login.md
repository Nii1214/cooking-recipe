# ADR 007: ゲストユーザーログイン

## 背景

本番デモ（[https://cooking-recipe-liard.vercel.app/](https://cooking-recipe-liard.vercel.app/)）公開後、未登録ユーザーがアプリの主要機能を試す導線が必要になった。

現状の認証フローは次のとおりである。

- 新規登録 → メール確認 → ログイン → プロフィール作成（`/profile/new`）→ アプリ利用
- 保護ルートは `proxy.ts` が Supabase セッションの有無で判定する
- データアクセスは Supabase RLS が `auth.uid()` を前提とする

「ゲストログイン」は、**メール登録なしで Supabase 上の正規セッションを確立し、既存の RLS / クリーンアーキテクチャを崩さずに体験できる手段**を指す。

---

## 目的

| 項目 | 内容 |
|------|------|
| **ユーザー体験** | LP やログイン画面からワンクリックでアプリ内に入れる |
| **セキュリティ** | 他ユーザーのデータにアクセスできない（家族単位の閉域性を維持） |
| **実装** | 既存の `AuthRepository` / Server Actions / RLS パターンを最大限再利用 |
| **将来** | 体験後に本登録（メールアドレス紐付け）へ移行できると望ましい |

---

## 評価基準（優先順位）

1. **セキュリティ** … RLS 整合、認証情報の漏洩リスク、悪用・スパム耐性
2. **実装難易度** … 既存コードとの親和性、Supabase / Vercel 設定の複雑さ
3. **保守性** … 運用作業（データ掃除、鍵ローテーション）、将来の本登録移行

---

## 案 A: Supabase Anonymous Sign-In（匿名認証）

### 概要

Supabase Auth の **Anonymous Sign-Ins** を有効化し、`signInAnonymously()` でゲストセッションを発行する。JWT の `is_anonymous` クレームでゲストを識別し、初回ログイン時にデフォルトプロフィールを自動作成する。体験後は Supabase の **Identity Linking**（`linkIdentity`）でメールアドレスを紐付け、本アカウントへ昇格させる。

### 実装イメージ

```
LP / ログイン画面
  → guestLoginAction
    → AuthRepository.signInAnonymously()
      → セッション確立（auth.uid() あり）
        → プロフィール未作成なら /profile/new（または自動作成）
          → /top へ
```

- Supabase Dashboard: `Enable anonymous sign-ins` を ON
- `config.toml`: `enable_anonymous_sign_ins = true`
- レート制限: `anonymous_users`（IP あたり時間当たり）を設定
- 本登録導線: 設定画面等から `updateUser` / `linkIdentity` でメール紐付け

### メリット

| 観点 | 内容 |
|------|------|
| **セキュリティ** | Supabase 公式機能。`auth.uid()` がユーザーごとに一意で、RLS をそのまま適用できる。IP ベースのレート制限あり。`service_role` をフロントに露出しない |
| **実装難易度** | 既存ログインと同様に `AuthRepository` にメソッド追加 + Server Action + UI ボタン程度。セッション管理は現行の `@supabase/ssr` を流用 |
| **保守性** | ドキュメント・社区の実績が豊富。Identity Linking により「ゲスト → 本登録」が公式パスとして存在 |
| **プロダクト整合** | ゲストごとに独立した `auth.users` / `profiles` / 家族データを持てる（デモ汚染がユーザー間で共有されない） |

### デメリット

| 観点 | 内容 |
|------|------|
| **セキュリティ** | 匿名アカウントの大量作成（スパム）対策はレート制限 + 必要なら CAPTCHA に依存。放置された匿名ユーザーが DB に残る |
| **実装難易度** | プロフィール自動作成、`is_anonymous` 分岐、本登録 UI、Auth 設定（本番 Dashboard + `config.toml`）が必要 |
| **保守性** | 匿名ユーザーの定期クリーンアップ方針（バッチ削除）を将来検討する必要がある |
| **UX** | Identity Linking のフロー設計（メール確認との整合）が別途必要 |

---

## 案 B: 共有デモアカウント（固定 credentials）

### 概要

あらかじめ Supabase 上に **1 つのデモ用アカウント**（メール + パスワード）を作成し、Vercel の環境変数（`GUEST_DEMO_EMAIL` / `GUEST_DEMO_PASSWORD`）に保存する。ユーザーが「ゲストとして試す」を押すと、Server Action がサーバー側で `signInWithPassword` し、セッション Cookie を返す。

### 実装イメージ

```
ゲストボタン
  → guestLoginAction（サーバーのみ env 参照）
    → signInWithPassword(demoEmail, demoPassword)
      → 全ゲストが同一 auth.uid() を共有
```

- デモ用プロフィール・家族・サンプルレシピを事前投入
- E2E テスト用アカウント（`E2E_TEST_EMAIL`）と同パターン

### メリット

| 観点 | 内容 |
|------|------|
| **セキュリティ** | パスワードをクライアントに返さず Server Action のみで使えば、公開鍵攻撃面は小さい |
| **実装難易度** | **最も低い**。既存 `login` フローの再利用。Auth 新機能の有効化不要 |
| **保守性** | デモデータを 1 アカウントに集約でき、リセットが単純 |
| **デモ品質** | 事前に用意したサンプルレシピ・家族を全員に見せられる（ポートフォリオ向き） |

### デメリット

| 観点 | 内容 |
|------|------|
| **セキュリティ** | **全ゲストが同一ユーザー**。1 人が編集・削除した内容が他のゲストにも影響。パスワード漏洩時はデモアカウントごと乗っ取られる。本番 DB にデモデータと実ユーザーデータが混在 |
| **実装難易度** | 低いが、同時アクセス時の競合（お気に入り ON/OFF 等）は考慮外になりがち |
| **保守性** | 定期的なデモデータ初期化が必須。パスワードローテーション時は Vercel env 更新 + Redeploy |
| **プロダクト整合** | 「家族だけの閉じた空間」というコンセプトと、全員共用の 1 家族デモは説明が必要 |

---

## 案 C: サーバー側 Ephemeral ユーザー自動発行（Admin API）

### 概要

Server Action 内で **`service_role` キー**（Vercel サーバーのみ）を使い、リクエストごと（またはセッションごと）に `guest-{uuid}@example.invalid` のようなユーザーを Admin API で作成する。メール確認をスキップし、即座に `signInWithPassword` または magic link でセッションを返す。

### 実装イメージ

```
ゲストボタン
  → guestLoginAction
    → Admin: auth.admin.createUser({ email, password, email_confirm: true })
      → signInWithPassword（通常 anon キー）
        → ゲストごとに別 auth.uid()
```

- 未使用ゲストユーザーの削除を Cron / 手動バッチで実施
- `service_role` は Server Action / Route Handler のみ

### メリット

| 観点 | 内容 |
|------|------|
| **セキュリティ** | ゲストごとに独立した `auth.uid()`。共有デモよりデータ分離は良い |
| **実装難易度** | Anonymous Sign-In より Supabase 設定は少ない場合がある |
| **UX** | メール確認なしで即ログイン可能 |

### デメリット

| 観点 | 内容 |
|------|------|
| **セキュリティ** | **`service_role` の取り扱いが最大リスク**。設定ミスで漏洩すると RLS 全 bypass。Admin API の乱用で `auth.users` 増殖 |
| **実装難易度** | **高い**。Admin クライアント分離、エラーハンドリング、本番 env 管理、クリーンアップジョブが必要 |
| **保守性** | **低い**。ユーザー削除バッチ、監視、コスト（Auth ユーザー数）の運用が継続的に必要 |
| **公式性** | Supabase が推奨する匿名体験パス（案 A）の迂回実装になりやすい |

---

## 比較サマリー

評価は **セキュリティ → 実装難易度 → 保守性** の優先順位で ★（5段階）を付けた。

| 案 | 方式 | セキュリティ | 実装難易度 | 保守性 | 総合 |
|----|------|:------------:|:----------:|:------:|:----:|
| **A** | Anonymous Sign-In | ★★★★★ | ★★★☆☆ | ★★★★☆ | **推奨** |
| **B** | 共有デモアカウント | ★★☆☆☆ | ★★★★★ | ★★★☆☆ | ポートフォリオ限定 |
| **C** | Admin API 自動発行 | ★★★☆☆ | ★★☆☆☆ | ★★☆☆☆ | 非推奨 |

---

## 推奨

**案 A（Supabase Anonymous Sign-In）を第 1 候補とする。**

理由:

1. **セキュリティ**: ゲストごとに独立した `auth.uid()` を Supabase 公式機能で担保でき、RLS / 家族閉域の設計を変更せずに済む
2. **実装難易度**: 案 C より `service_role` 不要。案 B より分岐は増えるが、Auth 層の拡張に留まる
3. **保守性**: Identity Linking による本登録移行が将来の正式ルートになる

**案 B** は、ポートフォリオで「全員同じサンプル家族を見せたい」場合の **短期デモ専用** としてはあり得るが、セキュリティ優先の観点では本番の一般ゲスト導線には向かない。

**案 C** は、`service_role` 運用コストと公式パス（案 A）との重複のため、採用しない。

---

## 採用しない設計

### Cookie のみの「擬似ゲスト」（Supabase セッションなし）

- RLS が `auth.uid()` を前提とするため、認証なしでは書き込み不可
- 読み取り専用を `service_role` や public policy で無理やり通すと、**家族データの閉域性が破綻**する

---

## 案 A 採用時の実装スコープ（参考）

第 1 PR で想定する最小スコープ:

| 層 | 内容 |
|----|------|
| Supabase | Anonymous Sign-Ins 有効化、`config.toml` 同期、必要なら `is_permanent_user()` と少数 RLS 関門 |
| domain / infrastructure | `AuthRepository.signInAnonymously()` |
| usecase / app | `guestLoginUsecase` / `guestLoginAction` |
| presentation | ログイン・LP に「ゲストで試す」ボタン |
| profile | ゲスト初回のプロフィール自動作成 or 簡易フォーム |
| docs | 本 ADR の「決定内容」更新（採用確定後） |

スコープ外（後続 PR）:

- Identity Linking による本登録
- 匿名ユーザーの定期削除バッチ
- CAPTCHA 導入

---

## Q&A

案 A を検討する際に挙がった論点と、方針の整理。

### Q1. RLS 的に、ゲストユーザーができることを Anonymous Sign-In で制御できるか？

**A. Anonymous Sign-In 単体では制御できない。RLS で `is_anonymous` を参照すれば制御できる。**

| レイヤー | 役割 |
|---------|------|
| **Anonymous Sign-In** | メールなしで `auth.users` を作成し、JWT に `auth.uid()` と `is_anonymous: true` を付与する **認証手段** |
| **RLS** | そのセッションで **どの行に SELECT / INSERT / UPDATE / DELETE できるか** を決める **認可（Authorization）** |

Anonymous Sign-In は権限セットを自動付与しない。Supabase Dashboard で有効化しただけでは、**既存 RLS がそのまま適用される**。

本プロジェクトの現状マイグレーションは `auth.uid()` のみを参照しており、`is_anonymous` の分岐はない（例: `families` の INSERT は `auth.uid() is not null`）。そのため **設定だけ ON にすると、ゲストも uid スコープ内では本ユーザーに近い操作が可能**になる。

RLS から匿名ユーザーを識別する例:

```sql
(auth.jwt() ->> 'is_anonymous')::boolean = true        -- ゲスト
(auth.jwt() ->> 'is_anonymous')::boolean is not true   -- 本登録ユーザー
```

Identity Linking でメールを紐付けると `is_anonymous` が `false` になり、同じ `auth.uid()` のまま本ユーザー扱いに移行できる。

---

### Q2. 全機能の RLS で `is_anonymous` をチェックするのは面倒ではないか？

**A. 全ポリシーに書く必要はない。既存の `auth.uid()` ベース RLS と「少数の関門」で足りる。**

#### そもそもチェック不要な操作が多い

Anonymous ユーザーも **ゲストごとに独立した `auth.uid()`** を持つ。既存ポリシー（`author_id = auth.uid()`、`user_id = auth.uid()` 等）により、**最初から自分のデータだけ**に閉じ込められる。レシピ CRUD・プロフィール・お気に入りなどは、ポリシー追加なしでもゲスト同士のデータ混線は起きにくい。

`is_anonymous` の明示チェックが必要なのは、主に次のような **関門（choke point）** だけである。

- 他人に影響する操作（家族への招待・参加など）
- 本登録ユーザーだけに許したい操作
- スパム対策で明示的に止めたい操作

#### ヘルパー関数に集約する（ADR 006 と同パターン）

`is_same_family()` と同様、匿名判定も **1 関数に集約**し、変更が必要なポリシーだけで使う。

```sql
-- 例: 本登録ユーザー（匿名でない）か
create function is_permanent_user()
returns boolean
language sql stable
as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false;
$$;
```

```sql
-- 例: 家族作成は本登録のみ
with check (is_permanent_user());
```

全テーブル・全操作ではなく、**数本のポリシー追加・変更** に留める。

#### ゲスト = サンドボックス体験と割り切る

| ゲストに許可（既存 RLS で足りることが多い） | 本登録のみ（RLS / usecase で制限） |
|------------------------------------------|----------------------------------|
| プロフィール作成 | 家族への招待・参加（将来） |
| 自分だけの家族作成 | 他ユーザーへの共有系で追加制限が必要な操作 |
| 自分のレシピ CRUD | 課金・管理機能（将来） |
| `/top` などの閲覧 | |

#### RLS とアプリ層の分担

| 層 | 役割 |
|----|------|
| **RLS** | データ漏洩・他人への影響を防ぐ **最低限の関門** |
| **usecase / UI** | 「ゲストの方は本登録してください」等の **UX 上の制限** |

UI だけの制限は bypass されうるため、セキュリティ上重要な操作は RLS 側にも関門を置く。細かい案内やボタン非表示は usecase / presentation に任せる。

#### 案 B（共有デモ）とのトレードオフ

| | 案 A（Anonymous） | 案 B（共有デモ） |
|--|------------------|-----------------|
| RLS 追加 | 少数の関門 + ヘルパー 1 つ | ほぼ不要 |
| データ分離 | uid ごとに自動 | 全ゲストが同一 uid |
| 保守 | ポリシー数本 + Auth 設定 | デモデータリセット運用 |

「`is_anonymous` チェックの面倒さ」を避けるなら案 B の方が楽だが、セキュリティ・体験の観点では案 A を優先する、という整理。

---

## ゲスト権限モデル（案 A 採用時の方針）

Q1 / Q2 を踏まえ、案 A 採用時は次を前提とする。

1. **データ分離** … 既存の `auth.uid()` ベース RLS を基本とし、ゲストも独立サンドボックスで体験する
2. **追加 RLS** … `is_permanent_user()` 等のヘルパーを導入し、本登録必須の操作だけポリシーを足す（全機能チェックはしない）
3. **UX 制限** … usecase / UI で本登録導線を示す
4. **本登録後** … Identity Linking により `is_anonymous = false` となり、追加 RLS 関門を自動的に通過できる

---

## 関連ドキュメント

- [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Identity Linking](https://supabase.com/docs/guides/auth/auth-identity-linking)
- [ADR 002: Supabase](./02-Supabase.md)
- [ADR 005: 家族機能](./05-family-feature.md)
- [ADR 006: RLS ヘルパー関数](./06-rls-helper-functions.md)
- [デプロイ手順](../guides/deploy-vercel-supabase.md)

---

## 決定内容

**案 A（Supabase Anonymous Sign-In）を採用する。**

| 項目 | 方針 |
|------|------|
| **権限** | 既存 RLS（`auth.uid()`）を維持。ゲストも本ユーザーと同様にデータ登録・操作可（サンドボックスは uid 単位） |
| **`is_anonymous` 関門** | 第 1 段階では追加しない（Q2 参照） |
| **データ寿命** | **6 時間おきバッチ**（Supabase pg_cron + SQL）で匿名ユーザーと関連 DB データを削除 |
| **FK** | `families.owner_id` に `ON DELETE CASCADE` を付与し、ユーザー削除時に家族ツリーも連鎖削除 |

### ゲスト削除バッチ（pg_cron + SQL）

- **Supabase pg_cron + SQL 関数** `public.cleanup_anonymous_users()` で `is_anonymous = true` の全ユーザーを削除（6 時間おき）
- `auth.users` 削除により、`profiles` / `recipes` / `family_members` / `families`（オーナー時）等が CASCADE
- **Vercel / Auth Admin API / `service_role` は不使用**（プロジェクト方針に合わせ Supabase 内で完結）
- S3 サムネイルの孤立ファイル削除は別途検討（第 2 段階）
- 本登録（Identity Linking）済みユーザーは `is_anonymous = false` のため対象外

運用手順: [ゲストユーザー削除バッチ — 運用手順書](../guides/guest-cleanup-batch-operations.md)

---

## ステータス

| 項目 | 値 |
|------|-----|
| **状態** | **案 A 採用・実装中** |
| **ブランチ** | `feature/guest-login` |
| **次のアクション** | ゲストログイン UI + Auth 実装 → 日次バッチ PR |
