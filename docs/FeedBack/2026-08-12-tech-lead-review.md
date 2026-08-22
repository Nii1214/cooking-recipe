# 技術リードレビュー：学習・発信のためのフィードバック

- **対象リポジトリ:** cooking-recipe（食卓手帖）
- **レビュー日:** 2026-08-12（同日追記: 追加観点 + 基礎力マップ）
- **視点:** シニアテックリード（技術力の底上げ × Qiita/Zenn 発信）
- **前提:** コードは動いている。完璧な理解より「伸びしろの言語化」を優先する
- **開発者プロファイル（追記時）:** 生成 AI でほぼ全開発 / コーディング実務 ~1 年 / Next・React・TS の業務経験なし

---

## 総評（先に一言）

個人開発としては、**クリーンアーキテクチャを ESLint で機械強制し、RLS・Auth callback・S3 非公開・カバレッジ 80% まで揃え、ADR / tips / bugs で「なぜ」を残している**点が突出している。  
発信素材はすでにコードと docs の中にあり、足りないのは「ストーリーとしての切り出し」と「仕組みの一段深い理解」である。

AI 開発 × 実務未経験という前提では、次のギャップが本丸になりやすい。

- **構成・設計の到達点は高い**（このリポジトリが証拠）
- **一行の意味・ブラウザ/HTTP/型の基礎語彙**が追いついていない箇所が残る（例: Hook の使い分けが怪しい）
- 対策は「React 全暗記」ではなく、**このリポジトリで実際に使っている技術から逆算して埋める**こと（詳細は §5・§6）

---

## 1. 【記事化おすすめテーマ】（技術発信で評価されるネタ）

単なる「作り方」ではなく、**課題 → 失敗 → 設計判断 → 実装** のストーリーが書けるものを優先した。

---

### 1-1. Supabase メール確認で本番リンクが localhost になる問題

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/app/auth/callback/route.ts`（`GET` / `toSafeNextPath`）<br>`src/lib/site-url.ts`（`getSiteOrigin`）<br>`src/infrastructure/repositories/auth-repository-impl.ts`（`emailRedirectTo`）<br>`src/constants/auth.ts`<br>`docs/tips/email-confirmation-and-auth-callback.md` |
| **現状のコードの役割** | 確認メールの戻り先をアプリ側 `/auth/callback` に固定し、`code`（PKCE）と `token_hash`（OTP）の両方でセッション確立。オリジンは `NEXT_PUBLIC_SITE_URL` 優先で解決し、`next` クエリはオープンリダイレクト防止で丸める。 |
| **抽出理由と学びのポイント** | 「動いたつもり」から本番で落ちる典型事故。Hosting の Site URL / Redirect URLs / アプリの `emailRedirectTo` / オリジン解決の **4 点が揃わないと壊れる**話は、読者の再現性が高く反応が取りやすい。すでに tips にフロー図と不具合経緯があるので、記事化コストが低い。 |
| **記事アウトライン案** | **タイトル例:** 「Supabase の確認メールが localhost に飛ぶ理由と、Next.js で直した話」<br>1. 症状（本番メールのリンクが localhost）<br>2. 確認フロー全体図（確認完了 ≠ セッション確立）<br>3. Site URL / Redirect URLs / `emailRedirectTo` / `getSiteOrigin` の責務分担<br>4. `code` と `token_hash` 両対応にした理由<br>5. `toSafeNextPath` でオープンリダイレクトを防ぐ<br>6. 本番チェックリスト |

---

### 1-2. PostgreSQL RLS の無限再帰を `security definer` で解く

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `docs/adr/06-rls-helper-functions.md`<br>`supabase/migrations/20260307000002_create_family_tables.sql`（`get_my_family_ids` / `is_same_family`）<br>`supabase/migrations/20260307000003_create_recipe_tables.sql`（`accessible_recipe_ids` ビュー） |
| **現状のコードの役割** | `family_members` をポリシー内で直接参照すると RLS が再帰する問題を、`security definer` ヘルパーで回避。子テーブルは `accessible_recipe_ids`（`security_invoker`）で親 RLS を再利用。 |
| **抽出理由と学びのポイント** | 「RLS を入れただけ」の記事は多いが、**再帰エラーの構造説明 → 代替案比較 → ヘルパー＋ビューの二段構え**まで書ける記事は少ない。個人開発でも「家族共有」は共感されやすく、セキュリティ系で評価されやすい。ADR がほぼ記事の下書きになっている。 |
| **記事アウトライン案** | **タイトル例:** 「Supabase RLS で無限再帰した話：`security definer` とビューで家族共有を設計する」<br>1. やりたかった権限モデル（自分＋家族の公開レシピ）<br>2. 素直なポリシーが再帰する理由（図解）<br>3. 捨てた案（ポリシー重複記述、アプリ側フィルタのみ）<br>4. `get_my_family_ids` / `is_same_family` の採用理由<br>5. 子テーブルを `accessible_recipe_ids` に寄せた理由<br>6. `search_path` 固定など security definer の落とし穴 |

---

### 1-3. ESLint でクリーンアーキテクチャの依存を機械強制する

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `eslint.config.mjs`（`FORBIDDEN` / `restrictedImportRule`）<br>`docs/guides/eslint-clean-architecture.md`<br>`docs/architect/clean-architecture-and-directory.md`<br>usecase 例: `src/usecase/recipe/create-recipe-usecase.ts`（`CreateRecipeDeps`） |
| **現状のコードの役割** | domain / usecase は `error`、infrastructure / presentation は `warn` で層跨ぎ import を禁止。usecase は infra / lib を直接触らず、deps で注入する。 |
| **抽出理由と学びのポイント** | 「クリーンアーキを勉強した」系は多いが、**Lint ルールとして運用に落とした具体コード**は希少。個人開発でも破綻しにくい仕組みとして刺さる。deps DI とセットで書くと実践記事になる。 |
| **記事アウトライン案** | **タイトル例:** 「個人開発でも崩れないクリーンアーキ：ESLint `no-restricted-imports` で依存を強制する」<br>1. 文書だけだと守られない問題<br>2. 層ごとの禁止リスト設計<br>3. usecase は deps オブジェクトでテスト容易に<br>4. error と warn の使い分け<br>5. Auth だけ DIContainer が残っている話（移行のリアル） |

---

### 1-4. `ILIKE` を捨てて `strpos` RPC にしたキーワード検索

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `docs/design/レシピ検索-キーワードマッチング設計.md`<br>`src/infrastructure/repositories/recipe/recipe-read-repository-impl.ts`（`recipe_summaries_ids_matching_keyword` RPC） |
| **現状のコードの役割** | `%` / `_` をメタ文字として解釈する `ILIKE` を避け、DB 側で `strpos` + `lower` の部分一致 RPC を呼び、該当 ID で一覧を絞り込む。 |
| **抽出理由と学びのポイント** | 「エスケープすればよい」と思いがちな落とし穴を、**PostgREST の制約込みで設計回避した**ストーリーが強い。セキュリティ（インジェクション）と検索正しさ（メタ文字）を混同しがちな点も教育的。 |
| **記事アウトライン案** | **タイトル例:** 「Supabase で `%` がワイルドカードになる問題：ILIKE をやめて strpos RPC にした理由」<br>1. 「50%」で意図しないヒットが出る<br>2. アプリ側エスケープだけでは足りない理由<br>3. 選択肢 A/B/C の比較（設計書そのまま）<br>4. RPC → ID 配列 → `in` 絞り込みの実装<br>5. 規模が増えたときの限界（URL 長・インデックス） |

---

### 1-5. 非公開 S3 + プレサイン URL + アプリ内レート制限

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/lib/get-presigned-image-url.ts`<br>`src/domain/repositories/recipe/recipe-thumbnail-storage.ts`<br>`src/infrastructure/storage/recipe-thumbnail-storage-impl.ts`<br>`src/usecase/recipe/upload-recipe-thumbnail-usecase.ts`<br>`src/lib/recipe-thumbnail-upload-controls.ts`<br>`docs/tips/image-upload-with-s3.md` / `docs/architect/` の S3 関連 |
| **現状のコードの役割** | バケット非公開。アップロードは usecase で MIME/サイズ検証 → storage 抽象に委譲。表示はサーバーでプレサイン GET。Action 層でプロセス内レート制限と構造化監査ログ。 |
| **抽出理由と学びのポイント** | 「Supabase Storage で簡単に」ではなく、**権限境界（Domain Storage 抽象）と漏洩時の被害限定（期限付き URL）**まで語れる。個人開発でも「公開バケット直 URL」を避ける姿勢は発信価値が高い。 |
| **記事アウトライン案** | **タイトル例:** 「レシピ画像を公開バケットにしない：S3 プレサイン URL と usecase バリデーションの設計」<br>1. なぜ DB には path だけ保存するか<br>2. クライアント直アップロード vs サーバー経由<br>3. usecase のバリデーションと infra の責務分離<br>4. レート制限の限界（プロセス内 Map → Redis）<br>5. 監査ログを JSON 一行にした意図 |

---

### 1-6. ゲスト削除を Vercel Cron ではなく `pg_cron` にした判断

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `supabase/migrations/20260801000001_guest_cleanup_pg_cron.sql`<br>`docs/implementation/guest/guest-cleanup-batch.md`<br>`docs/guides/guest-cleanup-batch-operations.md`<br>`docs/adr/07-guest-login.md` |
| **現状のコードの役割** | Anonymous ユーザーの期限切れ削除を DB 側ジョブ（`cleanup_anonymous_users` + `cron.schedule`）に寄せる。アプリの `/api/cron` は採用していない。 |
| **抽出理由と学びのポイント** | 「Cron はどこに置くか」は実務でよく議論される。**ホスティング Cron vs DB Cron** のトレードオフ（認証ヘッダ、スリープ、権限、監査）を自分の選択理由で書けると差別化できる。 |
| **記事アウトライン案** | **タイトル例:** 「ゲストユーザー掃除を Vercel Cron から pg_cron に移した理由」<br>1. Anonymous Sign-In の寿命問題<br>2. アプリ Cron の痛点（秘密ヘッダ、デプロイ依存）<br>3. `security definer` SQL + CASCADE の設計<br>4. 運用手順（ガイドへのリンク） |

---

### 1-7.（ボーナス）Next.js `redirect()` 例外と Server Action の共存

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/utils/redirect.ts`（`isRedirectError`）<br>各 `*.action.ts` / 対応テスト（`NEXT_REDIRECT` digest） |
| **現状のコードの役割** | `redirect()` が投げる特殊例外を try/catch で飲み込まないための判定ヘルパ。 |
| **抽出理由と学びのポイント** | 短いが「はまった人あるある」。短編記事や tips 向き。テストで digest を検証している点もセットで書ける。 |
| **記事アウトライン案** | **タイトル例:** 「Server Action で `redirect()` を catch してログインできなくなった話」 |

---

## 2. 【技術力向上のための深掘りポイント】（理解を深めると一皮むける領域）

「動いているが、仕組みを言語化できていないと次の設計で詰まる」箇所。

---

### 2-1. Auth の二系統 DI（DIContainer vs deps）を自分の言葉で統合する

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/lib/di-container.ts`<br>`src/app/(auth)/login/login.action.ts` 等<br>`src/usecase/recipe/create-recipe-usecase.ts`（`CreateRecipeDeps`）<br>`BACKLOG.md`（deps 統一タスク） |
| **現状のコードの役割** | Auth はクラス UseCase + 静的 DIContainer。Recipe/Family/Profile は関数 UseCase + deps オブジェクト。 |
| **なぜ深掘りが重要か** | 「どっちが正しいか」ではなく、**テスト容易性・循環依存・リクエスト寿命・シングルトン危険性**を比較できると設計者として一段上がる。BACKLOG に既にあるので、リファクタ自体が学習課題になる。 |
| **学び方の提案** | 1. DIContainer 版 Login を deps 直渡しに書き換える（小さく）<br>2. テスト差し替えがどう変わるか比較記事を下書きする<br>3. 「Service Locator vs Constructor/Args Injection」の用語で整理する |

---

### 2-2. proxy（旧 middleware）と RLS の「二重の門」

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/proxy.ts`（`proxy` / `PUBLIC_PATHS` / cookie `setAll`）<br>各テーブルの RLS ポリシー（migrations）<br>`docs/adr/06-rls-helper-functions.md` |
| **現状のコードの役割** | proxy は未ログインを `/login` へ。データ権限は DB RLS。callback はセッション確立前に来るため PUBLIC。 |
| **なぜ深掘りが重要か** | 「フロントで隠す」と「DB で拒否する」の違いを誤解すると、**UI だけ守って API/直クエリが抜ける**事故が起きる。`getUser()` と cookie コピーの NOTE は、SSR セッションの本質に触れている。 |
| **学び方の提案** | 1. proxy を外しても RLS で守られるか実験する（ローカル）<br>2. `getSession` vs `getUser` の公式推奨理由を読む<br>3. 「認可はどこに置くか」を図にして ADR 追記 |

---

### 2-3. Supabase SSR クライアントと Cookie 境界

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/lib/supabase/server.ts`（`createClient` / `createAuthedClient`）<br>`src/lib/supabase/client.ts`<br>`src/proxy.ts` |
| **現状のコードの役割** | サーバー／ブラウザでクライアント生成方法を分離。未認証を `UNAUTHORIZED` として扱う経路もある。 |
| **なぜ深掘りが重要か** | Next App Router × Supabase で最も詰まりやすい層。**誰が Cookie を読むか・書くか・いつ更新するか**を説明できると、他サービスの Auth 実装にも転用できる。 |
| **学び方の提案** | シーケンス図を自分で描き直す（ログイン / callback / 保護ページ）。公式 `@supabase/ssr` の cookie 例と自コードを Diff する。 |

---

### 2-4. Result 型・判別共用体とエラー境界の一貫性

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/types/auth.ts`（`AuthResult`）<br>`UploadRecipeThumbnailResult`（`upload-recipe-thumbnail-usecase.ts`）<br>`src/infrastructure/utils/auth-error-handler.ts`<br>`src/constants/error-messages.ts` |
| **現状のコードの役割** | 成功/失敗を例外ではなく `{ success }` で返す箇所と、例外＋メッセージ変換が混在しうる。 |
| **なぜ深掘りが重要か** | 「どこで例外を止め、どこで Result に変換するか」はチーム規模が小さいうちに決めると後が楽。TypeScript の narrowing 力もここで伸びる。 |
| **学び方の提案** | 層ごとに「例外を投げてよい境界」を表にする。Action は Result、infra は例外、などルールを明文化してから揃える。 |

---

### 2-5. テスト設計：deps モックと Supabase チェーンモック

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/test-utils/supabase-mock.ts`（`createQueryBuilder` / `createMockAuthedClient`）<br>`*-deps-for-test.ts`<br>`vitest.config.ts`（coverage 80% thresholds）<br>`e2e/`（CI 外） |
| **現状のコードの役割** | usecase は deps 差し替えで単体テスト。infra は PostgREST 風チェインを thenable で模倣。カバレッジゲートあり。E2E は Playwright だが CI 未統合。 |
| **なぜ深掘りが重要か** | 「カバレッジが高い」と「壊れ方を検知できる」は別物。**何をモックし、何を結合で見るか**を語れるとシニア寄りのテスト設計になる。`builder.then` で Promise のように見せる技法は、ライブラリの挙動理解そのもの。 |
| **学び方の提案** | 1. supabase-mock が本物のクエリビルダのどの API を近似しているか一覧化<br>2. E2E を CI に入れる最小構成を設計（secret の扱い含む）<br>3. 「usecase 80%」が保証しないもの（RLS・実 Cookie）を明記 |

---

### 2-6. 非同期オーケストレーションと整合性

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/usecase/recipe/create-recipe-usecase.ts`（`Promise.all` で materials/instructions/categories） |
| **現状のコードの役割** | 親レシピ作成後、子データを並列保存。 |
| **なぜ深掘りが重要か** | 成功パターンは速いが、**途中失敗時の半端なデータ**（親だけ残る）をどう扱うかは DB トランザクション／補償トランザクションの話につながる。次のレベル（家族招待・Identity Linking）でも同じ問いが出る。 |
| **学び方の提案** | 失敗注入テストを書く。Supabase/Postgres で「1 リクエスト複数表」をトランザクションにする選択肢（RPC）を調べ、ADR 下書きにする。 |

---

### 2-7. レート制限のプロセス内実装の限界

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/lib/recipe-thumbnail-upload-controls.ts`（`timestampsByUser` Map） |
| **現状のコードの役割** | ユーザー単位のスライディングウィンドウ風制限。コメントで Redis 移行を示唆。 |
| **なぜ深掘りが重要か** | サーバーレス／マルチインスタンスでは **プロセス局所状態が効かない**。コメントで自覚はあるので、「なぜ今はこれでよいか／いつ壊れるか」を数値で説明できると運用力が上がる。 |
| **学び方の提案** | Vercel のインスタンスモデルを調べ、同一制限が N 倍になるシナリオを文書化。Upstash Redis 等との比較表を作る。 |

---

## 3. 【再利用・モジュール化の候補】（他プロジェクトでも使える資産）

プロダクト固有ロジックを剥がすと、そのまま「自作ユーティリティ集」やテンプレにできるもの。

---

### 3-1. サイトオリジン解決

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/lib/site-url.ts` + `src/lib/site-url.test.ts` |
| **現状のコードの役割** | 環境変数優先、未設定時は `x-forwarded-host` / `host` + proto 解決。ローカル判定あり。 |
| **汎用化アドバイス** | `getSiteOrigin({ envKey, fallback })` のように引数化。Auth 以外（OGP、絶対 URL 生成、Webhook 署名検証）にも使える。「Next.js で絶対 URL を間違えないヘルパ」として独立リポジトリ or gist 化しやすい。 |

---

### 3-2. オープンリダイレクト防止付き next パス正規化

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/app/auth/callback/route.ts` 内 `toSafeNextPath` |
| **現状のコードの役割** | `/` 始まりかつ `//` 禁止のパスだけ許可。 |
| **汎用化アドバイス** | `src/utils/safe-redirect-path.ts` に切り出し、login の `redirectTo` とも共有。記事「ログイン後リダイレクトを安全にする 10 行」向き。許可パスの allowlist 版もオプションで。 |

---

### 3-3. `isRedirectError` / Server Action ユーティリティ

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/utils/redirect.ts` |
| **現状のコードの役割** | `NEXT_REDIRECT` digest 判定。 |
| **汎用化アドバイス** | Next バージョン追従が必要な薄いラッパとして `@your/next-action-utils` に。公式 `unstable_rethrow` との使い分けメモを README に必須。 |

---

### 3-4. ESLint クリーンアーキ制約プリセット

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `eslint.config.mjs` の `FORBIDDEN` ブロック<br>`docs/guides/eslint-clean-architecture.md` |
| **現状のコードの役割** | 層別 `no-restricted-imports`。 |
| **汎用化アドバイス** | `eslint-config-clean-layers` のような共有 config パッケージ化。ディレクトリ名（domain/usecase/...）をオプションにする。Qiita より npm 公開の方が資産性が高い。 |

---

### 3-5. Supabase クエリビルダモック

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/test-utils/supabase-mock.ts` |
| **現状のコードの役割** | `from().select().eq()...` をチェイン＋ thenable で模倣。 |
| **汎用化アドバイス** | 必要メソッド（`update` / `upsert` / `range` 等）を拡張し、`@your/supabase-test-utils` に。記事「PostgREST チェインを Vitest でモックする最小実装」とセット。 |

---

### 3-6. deps-for-test パターン

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | 各 `src/usecase/**/*-deps-for-test.ts` |
| **現状のコードの役割** | usecase テスト用のデフォルトモック deps を生成。 |
| **汎用化アドバイス** | フレームワークというより **チーム規約**。ボイラープレート生成スクリプト（hygen / 自作 CLI）にすると新機能追加が速い。「usecase + deps + test のスキャフォールド」記事向き。 |

---

### 3-7. Toast クエリ連動コンポーネント

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/presentation/components/ToastFromSearchParams.tsx`<br>`src/constants/toast-messages.ts` |
| **現状のコードの役割** | `?toast=` で成功メッセージ表示後、クエリ除去（Suspense 境界付き）。 |
| **汎用化アドバイス** | Server Action → redirect 後のフラッシュメッセージ定石。メッセージ辞書を inject する汎用コンポーネントにすると他アプリでもそのまま使える。 |

---

### 3-8. CI ワークフロー骨格

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `.github/workflows/ci.yml` |
| **現状のコードの役割** | Node 20 + `npm ci` + lint + vitest。 |
| **汎用化アドバイス** | 現状は最小構成。再利用資産にするなら **coverage レポート upload / Playwright job（optional）/ キャッシュ戦略**を足した「個人開発向け CI テンプレ」記事がよい。今のままでも「まずこれだけ」テンプレとして価値あり。 |

---

### 3-9. Auth エラーメッセージマッピング

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/infrastructure/utils/auth-error-handler.ts` |
| **現状のコードの役割** | Supabase エラーコードを日本語 UX に変換。 |
| **汎用化アドバイス** | プロバイダ差分（Supabase / Auth.js）をアダプタにする。i18n 辞書として切り出しやすい。 |

---

## 4. 【設計・コードの褒めポイント】（自信を持ってよい点）

技術責任者目線で「個人開発でここまでやっているのは評価が高い」点。

---

### 4-1. クリーンアーキを「文書＋Lint＋deps」の三点セットで運用している

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `eslint.config.mjs`、`docs/architect/clean-architecture-and-directory.md`、`CreateRecipeDeps` 等 |
| **現状のコードの役割** | 依存方向を人間の記憶ではなくツールで守る。 |
| **なぜ評価が高いか** | 多くの個人開発は「フォルダ分けしただけ」で終わる。**違反が CI で落ちる**状態は、実務のチーム開発と同じ規律。これは自信を持ってよい。 |

---

### 4-2. 「なぜ」を ADR / tips / bugs に残している

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `docs/adr/*`、`docs/tips/email-confirmation-and-auth-callback.md`、`docs/design/レシピ検索-キーワードマッチング設計.md`、`docs/bugs/` |
| **現状のコードの役割** | 採用理由・不採用理由・事故の事後分析。 |
| **なぜ評価が高いか** | コードより先に腐るのが文脈知識。未来の自分と読者（記事読者含む）への投資になっている。発信の原材料もすでに揃っている。 |

---

### 4-3. セキュリティをアプリの飾りではなく多層で考えている

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | RLS + `accessible_recipe_ids`、`toSafeNextPath`、非公開 S3 + プレサイン、アップロード検証・レート制限・監査ログ、`proxy` の公開パス設計 |
| **現状のコードの役割** | 入口・データ・ファイル・リダイレクトをそれぞれ守る。 |
| **なぜ評価が高いか** | 「Auth 入れた」で終わらず、**脅威ごとに対策レイヤが分かれている**。ジュニアとシニアの差が出やすい領域で、すでにシニア寄りの判断をしている。 |

---

### 4-4. usecase の薄さとテスト容易性

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/usecase/recipe/create-recipe-usecase.ts` ほか多数の `*.test.ts`<br>`vitest.config.ts` の 80% thresholds |
| **現状のコードの役割** | オーケストレーションに集中し、I/O は deps。カバレッジゲートで後退を防ぐ。 |
| **なぜ評価が高いか** | 「テストを書くための設計」ができている。個人開発で coverage threshold を本気で入れている例は少ない。 |

---

### 4-5. Auth callback の現実対応力

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/app/auth/callback/route.ts`（`code` / `token_hash` 両対応、OTP type ガード） |
| **現状のコードの役割** | メールテンプレやフロー差でパラメータが変わってもセッション確立できるようにしている。 |
| **なぜ評価が高いか** | チュートリアル写経では片方だけになりがち。**本番で壊れた経験をコードにフィードバックしている**痕跡があり、実務的。 |

---

### 4-6. proxy のコメント品質（セッション破壊の注意）

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `src/proxy.ts` の NOTE（`getUser` 前後にコードを挟まない / `supabaseResponse` を返す） |
| **現状のコードの役割** | 公式の落とし穴をコード横に固定。 |
| **なぜ評価が高いか** | 「動くコード」より「壊し方を知っているコード」の方がチームでは価値が高い。この NOTE はまさにそれ。 |

---

### 4-7. ゲスト機能の境界を ADR と BACKLOG で正直に管理している

| 項目 | 内容 |
|------|------|
| **対象ファイル/箇所** | `docs/adr/07-guest-login.md`、`BACKLOG.md`（Identity Linking、招待 UI、RLS 関門） |
| **現状のコードの役割** | やったこと／まだやらないことを分離。 |
| **なぜ評価が高いか** | 機能を盛りすぎず、**未完了を可視化できる**のはプロダクト判断力。技術力と同じく評価される。 |

---

## 5. 【追加観点】AI 開発前提でのレビュー（初版 4 観点の補完）

初版は「記事化・深掘り・再利用・褒め」に絞った。以下は、**生成 AI でほぼ全工程を進めている／Next・React・TS の実務未経験**という前提を踏まえた追加切り口である。

---

### 5-1. 「動くコード」と「説明できるコード」のギャップ

| 項目 | 内容 |
|------|------|
| **観点** | AI 開発では、層分け・Auth・RLS のような上位設計まで一気に揃いやすい一方、**一行の意味を口頭で説明できない**状態が残りやすい。 |
| **このリポジトリでの兆候** | `src/proxy.ts` の cookie `setAll`、`isRedirectError`、`useActionState` の第 2 引数 `FormData`、`"use client"` の境界など、「おまじない」になりやすい箇所が複数ある。 |
| **学びのポイント** | 面接・発信・デバッグのどれでも、「なぜこの API か」を 30 秒で言えるかが分岐点。コードを増やすより、**既存ファイルを 1 つ選んで自分の言葉で解説ノートを書く**方が伸びる。 |
| **実践** | 週 1 本、「このファイルを新人に説明する」メモを `docs/tips/` に足す（すでにその型の docs があるので型が揃っている）。 |

---

### 5-2. デバッグ力・障害切り分け（AI に聞く前の自分の手順）

| 項目 | 内容 |
|------|------|
| **観点** | 実務 1 年相当で差がつきやすいのは新機能より、**壊れたときの切り分け順序**。 |
| **このリポジトリでの題材** | メール確認 localhost（tips 済み）、RLS 再帰、`redirect` を catch してしまう問題、未ログイン時の proxy リダイレクト。 |
| **知っておくべき切り分け軸** | ブラウザ Network / Application（Cookie）→ サーバーログ → Supabase Dashboard（Auth / Logs）→ SQL を直接叩く、の順。 |
| **実践** | 意図的に壊して戻す演習（例: `AUTH_CALLBACK_PATH` を PUBLIC から外す → 何が起きるか観察）。 |

---

### 5-3. HTTP・ブラウザ基礎（フレームワークより先に効く）

| 項目 | 内容 |
|------|------|
| **観点** | Next / Supabase の理解不足の多くは、実は **Cookie・リダイレクト・オリジン・CORS・キャッシュ** の不足に帰着する。 |
| **このリポジトリとの対応** | `getSiteOrigin`、`exchangeCodeForSession`、proxy の Cookie 更新、プレサイン URL の有効期限。 |
| **最低限の語彙** | リクエスト/レスポンス、ステータスコード、`Set-Cookie`、リダイレクト 302/307、同一オリジン、クエリ vs パス、GET 冪等性。 |

---

### 5-4. SQL / RLS / インデックス感覚

| 項目 | 内容 |
|------|------|
| **観点** | アプリ層が綺麗でも、データ権限とクエリ性能の感覚がないと「動くが怖い」状態が続く。 |
| **このリポジトリとの対応** | `get_my_family_ids`、`accessible_recipe_ids`、`strpos` RPC、ゲスト掃除 SQL。 |
| **伸ばし方** | Supabase Studio でポリシーを外した SELECT を試し、「アプリを通さない直アクセス」で何が見えるかを体感する。 |

---

### 5-5. AI との役割分担リテラシー（技術発信ネタにもなる）

| 項目 | 内容 |
|------|------|
| **観点** | 「AI に書かせた」こと自体は弱点ではない。弱点は **レビューできないこと**。 |
| **自信を持ってよい点** | ADR・ESLint 層制限・テスト・BACKLOG で「何を信じ、何を疑うか」の枠がある。 |
| **伸ばす問い** | 生成コードをマージする前に「失敗したら何が残るか」「誰が権限を持つか」「テストは何を保証していないか」の 3 点を自分で書く。 |
| **記事化案** | 「AI でクリーンアーキを組んだ個人開発で、人間が必ずレビューしているチェックリスト」 |

---

### 5-6. 読みやすさ・命名・差分レビュー力

| 項目 | 内容 |
|------|------|
| **観点** | 実務では「書く速度」より「他人（未来の自分）が読めるか」。 |
| **このリポジトリでの強み** | ファイル命名規則、usecase の薄さ、定数の分離。 |
| **伸ばし方** | PR を自分で作る前提で、差分だけ見て意図が通るか確認する習慣。AI に「この diff のレビューコメントを書け」と頼み、その指摘が妥当か自分で判定する。 |

---

## 6. 【基礎力マップ】実務未経験 × AI 開発者向け「今知っておくべきこと」

前提の整理:

- コーディング実務 ~1 年、Next/React/TS の業務経験なし、開発のほぼ全てが生成 AI
- それでも **App Router・Server Actions・RLS・クリーンアーキ** まで到達している（構成力は既に上位）
- 一方で `useCallback` が怪しい、というのは自然。**このリポジトリでは `useCallback` / `useMemo` をほぼ使っていない**ため、優先度は高くない

方針: **教科書の全 Hook 暗記より、今のコードを説明できる語彙を先に埋める。**

優先度凡例: **P0** 今すぐ / **P1** 1〜2 ヶ月 / **P2** その後でよい / **後回し可**

---

### 6-1. JavaScript（React より先）

| 優先 | トピック | なぜ必要か | このリポジトリでの接点 |
|------|----------|------------|------------------------|
| **P0** | `const` / 分割代入 / スプレッド | ほぼ全ファイルの読み書きの土台 | 全体 |
| **P0** | `async` / `await` / Promise | サーバー処理の本体 | usecase / infrastructure / actions |
| **P0** | `Promise.all` の意味と失敗時挙動 | 並列保存の成功・失敗を語るため | `create-recipe-usecase.ts`、`getRecipeById` |
| **P0** | 配列メソッド（`map` / `filter` / `find` / `some`） | UI・データ変換の日常語 | presentation / usecase |
| **P0** | 真偽・`??` / `?.` / 早期 return | バグの大半がここ | 全体 |
| **P1** | クロージャ（関数が外側の変数を覚える） | `useEffect` やコールバック理解の前提 | `ToastFromSearchParams` 等 |
| **P1** | `FormData` / Web API の感覚 | Server Action の入力経路 | login/signup/recipe actions |
| **P1** | `JSON.stringify` と構造化ログ | 監査ログ・デバッグ | `logRecipeThumbnailUploadAudit` |
| **P2** | イベントループ（ざっくり） | 「なぜ await の後に続くか」 | 非同期全般 |
| **後回し可** | 高度な prototype / this 束縛 | 現代 TS/React では優先度低 | — |

**到達目標:** AI が書いた `await Promise.all([...])` を見て、「並列」「1 つ失敗したら全体失敗」を自分で説明できる。

---

### 6-2. TypeScript

| 優先 | トピック | なぜ必要か | このリポジトリでの接点 |
|------|----------|------------|------------------------|
| **P0** | `type` / `interface` の読み方 | domain が型の中心 | `src/domain/models/**` |
| **P0** | ユニオンと判別（`success: true \| false`） | Result パターンの本体 | `AuthResult`、`UploadRecipeThumbnailResult` |
| **P0** | `type` だけの import（`import type`） | バンドルと依存の意識 | 各所 |
| **P0** | 関数の引数・戻り値の型注釈 | JSDoc とセットで契約を読む | usecase 全体 |
| **P1** | ジェネリクスの「読み方」（書けるは次） | ライブラリ型・`useActionState` の型引数 | `useActionState<SignupResult \| null, FormData>` |
| **P1** | `unknown` vs `any`、型ガード | `isRedirectError` / catch 節 | `src/utils/redirect.ts` |
| **P1** | ユーティリティ型（`Pick` / `Omit` / `Partial`）の存在 | 他人の型を読むとき | 必要になったら |
| **P2** | 条件型・mapped types | ライブラリ作者寄りの話 | 今は不要 |
| **後回し可** | 高度な型パズル | 学習コスパが悪い | — |

**到達目標:** AI に `any` を消させず、自分で「ここはユニオンにすべき」と判断できる。

---

### 6-3. React（このアプリで実際に使っているもの優先）

このコードベースの Client 側の中心は次:

- `useState`（フォーム局部状態）
- `useActionState`（login/signup/family/profile）
- `useTransition`（レシピ作成・お気に入り・ログアウト）
- `useEffect` + `useRef`（トーストの一度表示）
- `Suspense`（`useSearchParams` 境界）

| 優先 | トピック | なぜ必要か | このリポジトリでの接点 |
|------|----------|------------|------------------------|
| **P0** | コンポーネントは関数、props は引数 | UI の最小単位 | `presentation/components/**` |
| **P0** | 再レンダーの感覚（state が変わると再実行） | 「なぜ画面が更新されるか」 | 全 Client Component |
| **P0** | `useState` | ローカル UI 状態 | `RecipeCreateForm`、材料・手順セクション |
| **P0** | リストの `key` | 並べ替え UI で壊れやすい | 材料・手順の DnD 周辺 |
| **P0** | 制御コンポーネント（input の value + onChange） | フォームの基本 | 各 Form |
| **P1** | `useActionState`（旧 useFormState 系） | このアプリの認証フォームの主軸 | `login-form.tsx` / `signup-form.tsx` |
| **P1** | `useTransition` と pending UI | サーバー処理中のボタン制御 | `FavoriteButton`、`RecipeCreateForm` |
| **P1** | `useEffect` の「同期」用途と依存配列 | クエリ連動トースト | `ToastFromSearchParams.tsx` |
| **P1** | `useRef`（値を覚えて再レンダーしない） | 二重 toast 防止 | 同上 `shownKeyRef` |
| **P1** | `Suspense` が必要な理由 | `useSearchParams` の制約 | `ToastFromSearchParams`、verify-email |
| **P2** | 合成（子どもを props で渡す）/ 小さなコンポーネント分割 | UI 成長時 | shadcn 利用箇所 |
| **後回し可** | **`useCallback` / `useMemo`** | 最適化 Hook。**現状ほぼ未使用**。React Compiler 方針とも優先度が合わない。意味だけ知れば十分 | 急いで深追いしない |
| **後回し可** | `useReducer` / Context 大規模状態 | グローバル状態ライブラリ未使用 | 今の設計では不要 |
| **後回し可** | class コンポーネント | 歴史的遺産 | 不要 |

**`useCallback` についての正直な答え:**  
「怪しい」のは問題だが、**今のあなたが最初に埋める穴ではない**。先に `useState` / 再レンダー / `useActionState` / `useTransition` を固める。`useCallback` は「子コンポーネントへの関数 props で不要な再レンダーを抑える（または依存配列を安定させる）ためのメモ化」とだけ覚え、必要になったら公式ドキュメントを読めばよい。

---

### 6-4. Next.js App Router（このリポジトリの本番知識）

| 優先 | トピック | なぜ必要か | このリポジトリでの接点 |
|------|----------|------------|------------------------|
| **P0** | App Router のファイル约定（`page` / `layout` / `route`） | ルーティングの地図 | `src/app/**` |
| **P0** | Server Component がデフォルト | データ取得の主戦場 | 各 `page.tsx` |
| **P0** | `"use client"` が必要になる条件 | 境界を誤るとバグる | presentation のフォーム類 |
| **P0** | Server Actions（`"use server"` / `*.action.ts`） | 変異の入口 | login/signup/recipe/family |
| **P0** | `redirect` / `notFound` | 制御フローが例外ベース | actions、`recipe/[id]` |
| **P1** | `cookies()` / `headers()` が async な理由の感覚 | SSR とリクエスト文脈 | `server.ts`、`site-url.ts` |
| **P1** | proxy（旧 middleware）の役割 | 認証ゲート | `src/proxy.ts` |
| **P1** | Route Handler（`route.ts`） | callback | `auth/callback/route.ts` |
| **P1** | `next/image` / `next/link` の役割 | 画像・遷移の定石 | RecipeCard 等 |
| **P1** | 環境変数 `NEXT_PUBLIC_*` とサーバー専用の違い | 秘密情報の漏洩防止 | Supabase / AWS |
| **P2** | キャッシュ・`revalidate` の全体像 | 将来の一覧パフォーマンス | 今は深さより地図 |
| **後回し可** | Pages Router | このリポジトリ非該当 | 触らなくてよい |

**到達目標:** 「この処理はサーバーで動くか、ブラウザで動くか」をファイルを見て即答できる。

---

### 6-5. データ・認証・セキュリティ（フレームワーク外だが必須）

| 優先 | トピック | なぜ必要か | このリポジトリでの接点 |
|------|----------|------------|------------------------|
| **P0** | 認証と認可の違い | UI ガードと RLS の役割分担 | proxy vs RLS |
| **P0** | セッション / Cookie のざっくりモデル | ログイン状態の正体 | Supabase SSR |
| **P0** | オープンリダイレクト | セキュリティ基礎 | `toSafeNextPath` |
| **P1** | PKCE / メール確認の流れ | Auth 記事の核心 | callback tips |
| **P1** | RLS は「DB に届いた後」の門 | 直アクセス耐性 | migrations / ADR 006 |
| **P1** | プレサイン URL の意味 | 非公開オブジェクト配信 | `getPresignedImageUrl` |
| **P1** | SQL の SELECT/INSERT/UPDATE/DELETE と JOIN 感覚 | リポジトリ実装の読解 | infrastructure |
| **P2** | トランザクション / 整合性 | レシピ作成の部分失敗 | create-recipe usecase |
| **P2** | レート制限・多インスタンス | サーバーレス前提 | `recipe-thumbnail-upload-controls.ts` |

---

### 6-6. テスト

| 優先 | トピック | なぜ必要か | このリポジトリでの接点 |
|------|----------|------------|------------------------|
| **P0** | 「単体テストは何を保証するか」 | カバレッジ信仰を避ける | vitest 80% |
| **P1** | モックと本物の境界 | supabase-mock の限界 | `src/test-utils/supabase-mock.ts` |
| **P1** | Arrange-Act-Assert の読み方 | テストを資産にする | 各 `*.test.ts` |
| **P2** | E2E をいつ書くか | CI 未統合の判断材料 | `e2e/**` |

---

### 6-7. 学習の進め方（AI 使い向け・具体）

教科書を最初から通すより、次のサイクルが効く。

1. **自分のファイルを 1 つ選ぶ**（例: `login-form.tsx`）
2. AI に「解説して」と頼む前に、**自分で 10 行だけ図または箇条書き**する
3. 公式ドキュメントの該当ページを開く（React / Next）
4. ズレを直す
5. 「30 秒説明」を `docs/tips` か学習メモに残す

**最初の 4 週間のおすすめ順番（このリポジトリ特化）:**

| 週 | テーマ | 対象ファイル |
|----|--------|--------------|
| 1 | Server vs Client、`useState` | 任意の Form 1 つ + 対応 `page.tsx` |
| 2 | Server Action + `redirect` + `FormData` | `login.action.ts` + `isRedirectError` |
| 3 | `useActionState` / `useTransition` | `login-form.tsx` と `FavoriteButton.tsx` |
| 4 | Cookie・proxy・callback | `proxy.ts` + `auth/callback/route.ts` + tips |

その後: TypeScript の判別ユニオン → RLS → `Promise.all` の失敗モード。

---

### 6-8. 「知らなくてよい／後回しでよい」リスト（安心材料）

時間が限られるときの切り捨て基準。

- `useCallback` / `useMemo` の習熟（意味の一行定義だけでよい）
- Redux / Zustand 等の状態管理ライブラリ
- Pages Router
- GraphQL
- 高度な TypeScript 型パズル
- Kubernetes / 本格インフラ
- 微前端・モノレポ高度運用

今のスタック（Next App Router + Supabase + 自前クリーンアーキ）を **説明・改修・発信できる**方が、キャリアにも発信にも直結する。

---

---

## 7. 【一覧表】重要度 × 難易度マトリクス

**読み方**

| 記号 | 意味 |
|------|------|
| **重要度 高** | 今のあなたが理解・説明できないと困る / 発信の核になりうる |
| **重要度 中** | 伸びしろ。1〜2 ヶ月以内に触れるとよい |
| **重要度 低** | 知っておくとよいが、今すぐでなくてよい |
| **難易度 低** | 1 ファイル + 公式ドキュメントで 1〜2 日 |
| **難易度 中** | 複数ファイル・概念のつながり。1〜2 週間 |
| **難易度 高** | DB/Auth/分散など前提知識が要る。1 ヶ月以上 |

**推奨アクション**

| 種別 | 記号 | 意味 |
|------|------|------|
| 学習 | 📚 | 自分用。記事化しない |
| 記事 | ✍️ | 本記事候補 |
| 短記事 | 📝 | tips 向き（500〜1500 字） |
| 深掘り | 🔍 | リファクタ or 実験とセット |
| 後回し | ⏸️ | 棚卸しのみ。触らなくてよい |

---

### 7-1. 四象限サマリ（まずここだけ見る）

```
                    難易度 低              難易度 中              難易度 高
              ┌──────────────────┬──────────────────┬──────────────────┐
  重要度 高   │ ① 最優先         │ ② 次に取り組む   │ ③ 時間を取って   │
              │ Server/Client    │ proxy vs RLS     │ RLS 再帰（記事） │
              │ useState         │ Cookie/Auth      │ メール確認（記事）│
              │ async/await      │ useActionState   │                  │
              │ 認証 vs 認可     │                  │                  │
              ├──────────────────┼──────────────────┼──────────────────┤
  重要度 中   │ ④ 余裕があれば   │ ⑤ 中期的         │ ⑥ 後半           │
              │ redirect 例外    │ Result 型        │ Promise.all 整合性│
              │ toSafeNextPath   │ テスト設計       │ レート制限限界   │
              │                  │ ESLint 記事      │ S3 記事          │
              ├──────────────────┼──────────────────┼──────────────────┤
  重要度 低   │ ⑦ 触る必要薄い   │ ⑧ いつか         │ ⑨ 今は不要       │
              │ useCallback      │ pg_cron 記事     │ 型パズル         │
              │ Toast 汎用化     │ ILIKE 記事       │ npm パッケージ化 │
              └──────────────────┴──────────────────┴──────────────────┘
```

**現実的な配分（再確認）**

| 種別 | 年間目安 |
|------|----------|
| 本記事（✍️） | **1〜2 本** |
| 短記事 / tips（📝） | **0〜2 本**（任意） |
| 学習（📚） | 週 1 ファイル解説メモ（公開しなくてよい） |
| 深掘り（🔍） | BACKLOG から 1 件ずつ |
| 後回し（⏸️） | 残り全部 |

---

### 7-2. 学習トピック（§6 基礎力）

| ID | トピック | 重要度 | 難易度 | 推奨 | 接点 |
|----|----------|--------|--------|------|------|
| L-01 | Server Component vs Client Component | 高 | 低 | 📚 | 各 `page.tsx` / Form |
| L-02 | `async` / `await` / Promise | 高 | 低 | 📚 | usecase / actions 全体 |
| L-03 | `useState` / 再レンダー | 高 | 低 | 📚 | 各 Form |
| L-04 | 認証 vs 認可 | 高 | 低 | 📚 | proxy vs RLS |
| L-05 | セッション / Cookie のざっくりモデル | 高 | 中 | 📚 | `proxy.ts`, Supabase SSR |
| L-06 | Server Actions + `FormData` | 高 | 中 | 📚 | `login.action.ts` 等 |
| L-07 | `useActionState` | 高 | 中 | 📚 | `login-form.tsx` |
| L-08 | `redirect` / `isRedirectError` | 高 | 低 | 📚 | actions + `redirect.ts` |
| L-09 | TypeScript 判別ユニオン（Result 型） | 高 | 中 | 📚 | `AuthResult` 等 |
| L-10 | HTTP 基礎（Cookie, リダイレクト, オリジン） | 高 | 中 | 📚 | `getSiteOrigin`, callback |
| L-11 | `useTransition` + pending UI | 中 | 低 | 📚 | `FavoriteButton` |
| L-12 | `useEffect` / `useRef` / `Suspense` | 中 | 中 | 📚 | `ToastFromSearchParams` |
| L-13 | `Promise.all` と失敗時挙動 | 中 | 中 | 📚 | `create-recipe-usecase.ts` |
| L-14 | RLS の位置づけ（DB 側の門） | 中 | 中 | 📚 | migrations / ADR 006 |
| L-15 | 単体テストが保証すること | 中 | 低 | 📚 | vitest 80% |
| L-16 | プレサイン URL | 中 | 中 | 📚 | `getPresignedImageUrl` |
| L-17 | 環境変数 `NEXT_PUBLIC_*` の違い | 中 | 低 | 📚 | Supabase / AWS |
| L-18 | モックと本物の境界 | 中 | 中 | 📚 | `supabase-mock.ts` |
| L-19 | キャッシュ / `revalidate` | 低 | 中 | ⏸️ | 将来 |
| L-20 | **`useCallback` / `useMemo`** | 低 | 中 | ⏸️ | ほぼ未使用。意味だけ |

---

### 7-3. 深掘りポイント（§2）

| ID | トピック | 重要度 | 難易度 | 推奨 | 接点 |
|----|----------|--------|--------|------|------|
| D-01 | proxy と RLS の二重の門 | 高 | 中 | 📚🔍 | `proxy.ts` + RLS |
| D-02 | Supabase SSR と Cookie 境界 | 高 | 中 | 📚🔍 | `server.ts`, `proxy.ts` |
| D-03 | 「動く」と「説明できる」のギャップ | 高 | 低 | 📚 | 週 1 解説メモ |
| D-04 | デバッグ切り分け手順 | 高 | 低 | 📚 | Auth / RLS 題材 |
| D-05 | Auth DI 二系統（DIContainer vs deps） | 中 | 中 | 🔍 | `di-container.ts`, BACKLOG |
| D-06 | Result 型とエラー境界の一貫性 | 中 | 中 | 🔍 | `AuthResult`, actions |
| D-07 | テスト設計（deps モック / supabase-mock） | 中 | 中 | 📚🔍 | test-utils, vitest |
| D-08 | 非同期オーケストレーションと整合性 | 中 | 高 | 🔍 | `create-recipe-usecase.ts` |
| D-09 | レート制限のプロセス内実装の限界 | 低 | 中 | ⏸️ | `recipe-thumbnail-upload-controls.ts` |
| D-10 | AI との役割分担（レビュー 3 問） | 中 | 低 | 📚📝 | マージ前チェックリスト |

---

### 7-4. 記事化テーマ（§1）

| ID | テーマ | 重要度（発信） | 難易度（執筆） | 下書きの有無 | 推奨 |
|----|--------|----------------|----------------|--------------|------|
| A-01 | メール確認 localhost 問題 | 高 | 中 | あり（tips） | ✍️ **第1本** |
| A-02 | RLS 無限再帰 + security definer | 高 | 高 | あり（ADR 006） | ✍️ **第2本** |
| A-03 | ESLint でクリーンアーキ強制 | 中 | 中 | あり（guide） | ⏸️ 余裕があれば |
| A-04 | ILIKE → strpos RPC | 中 | 中 | あり（設計書） | ⏸️ |
| A-05 | S3 非公開 + プレサイン + レート制限 | 中 | 中 | あり（tips） | ⏸️ |
| A-06 | pg_cron でゲスト削除 | 低 | 中 | あり（implementation） | ⏸️ |
| A-07 | `redirect()` 例外と Server Action | 中 | 低 | なし | 📝 短記事向き |
| A-08 | AI 開発の人間レビューチェックリスト | 中 | 低 | なし | 📝 任意 |

**記事化の現実ライン:** A-01 と A-02 だけ本気で書けば十分。A-07 / A-08 は短くてもよい。残りは書かなくてよい。

---

### 7-5. 再利用・モジュール化（§3）

| ID | 候補 | 重要度 | 難易度 | 推奨 | 備考 |
|----|------|--------|--------|------|------|
| R-01 | `getSiteOrigin` | 中 | 低 | ⏸️ | 記事 A-01 と一緒に学ぶ程度で十分 |
| R-02 | `toSafeNextPath` | 中 | 低 | ⏸️ | 切り出しは後でよい |
| R-03 | `isRedirectError` | 低 | 低 | ⏸️ | 短記事 A-07 とセットなら可 |
| R-04 | ESLint 層制約プリセット | 低 | 高 | ⏸️ | npm 化は今不要 |
| R-05 | supabase-mock | 低 | 中 | ⏸️ | 自分用で十分 |
| R-06 | deps-for-test パターン | 低 | 中 | ⏸️ | 規約として docs に残す程度 |
| R-07 | ToastFromSearchParams | 低 | 低 | ⏸️ | |
| R-08 | CI ワークフロー骨格 | 低 | 低 | ⏸️ | 現状のままでよい |
| R-09 | Auth エラーマッピング | 低 | 低 | ⏸️ | |

**方針:** 再利用化は「記事の副産物」程度。独立タスクにしない。

---

### 7-6. 優先順位トップ 15（これだけ押さえる）

| 順 | ID | 内容 | 重要度 | 難易度 | やること |
|----|-----|------|--------|--------|----------|
| 1 | L-01 | Server vs Client | 高 | 低 | 1 Form + 1 page を図解 |
| 2 | L-05 | Cookie / セッション | 高 | 中 | proxy + callback を読む |
| 3 | D-01 | proxy vs RLS | 高 | 中 | 「UI ガードだけでは足りない」を説明 |
| 4 | A-01 | メール確認記事 | 高 | 中 | tips をベースに 1 本だけ書く |
| 5 | L-07 | useActionState | 高 | 中 | login-form を 30 秒説明 |
| 6 | L-02 | async/await | 高 | 低 | usecase 1 本を追う |
| 7 | L-08 | redirect 例外 | 高 | 低 | action + test を読む |
| 8 | D-03 | 説明できるコード | 高 | 低 | 週 1 メモ（非公開可） |
| 9 | L-09 | Result 型 | 高 | 中 | AuthResult を narrowing 練習 |
| 10 | L-10 | HTTP 基礎 | 高 | 中 | getSiteOrigin とセット |
| 11 | D-02 | Supabase SSR Cookie | 高 | 中 | シーケンス図を自分で描く |
| 12 | A-02 | RLS 記事 | 高 | 高 | A-01 の後。ADR をベースに |
| 13 | L-06 | Server Actions | 高 | 中 | login.action 端到端 |
| 14 | D-04 | デバッグ手順 | 高 | 低 | 意図的に 1 箇所壊す演習 |
| 15 | L-04 | 認証 vs 認可 | 高 | 低 | 用語を自分の言葉で |

---

### 7-7. 象限別アクション早見表

| 象限 | 代表項目 | 今やること |
|------|----------|------------|
| **高 × 低** | L-01, L-02, L-08, D-03, D-04 | 学習メモ。記事化しない |
| **高 × 中** | L-05〜07, D-01, D-02, A-01 | 学習 + A-01 のみ記事化 |
| **高 × 高** | A-02 | 学習を先に。記事は 2 本目 |
| **中 × 低** | A-07, L-11, L-15 | 短記事 or 学習のみ |
| **中 × 中** | D-05〜07, A-03〜05 | BACKLOG / 余裕時 |
| **中 × 高** | D-08 | 機能追加時に一緒に |
| **低 × *** | R-*, A-06, L-20 | 触らない。一覧にあるだけでよい |

---

## 学習・発信ロードマップ（提案）

優先度を「発信しやすさ × 伸びしろ」で並べた目安。

| 順 | アクション | 対応セクション |
|----|------------|----------------|
| 1 | tips をほぼそのまま Qiita/Zenn 化（メール確認 localhost） | 1-1 |
| 2 | ADR 006 を図多めの RLS 再帰記事に再構成 | 1-2 |
| 3 | Auth DI を deps に統一しながら「DI 比較」記事の下書き | 2-1 / 1-3 |
| 4 | `toSafeNextPath` + `getSiteOrigin` を utils パッケージ化 | 3-1 / 3-2 |
| 5 | レシピ作成の部分失敗を題材にトランザクション学習 | 2-6 |
| 6 | E2E を CI に載せる設計を書き、テンプレ記事化 | 2-5 / 3-8 |
| 7 | S3 プレサイン＋レート制限の限界をセットで発信 | 1-5 / 2-7 |
| 8 | （追加）自分のコードを教材にした基礎シリーズを週 1 本メモ化 | 5 / 6 |
| 9 | （追加）「AI 開発の人間レビューチェックリスト」を記事化 | 5-5 |

---

## クロージング

このリポジトリは「個人の習作」ではなく、**設計判断を残し、機械で規律を守り、本番事故をドキュメントに還流させている**コードベースになっている。  
AI で組んだこと自体は弱点ではない。弱点になり得るのは、**動く理由を自分の語彙で返せないこと**だけである。

自信を持ってよい土台の上で、次に伸ばすのは次に絞るとよい。

1. **仕組みを自分の言葉で説明する**（proxy vs RLS、DI 二系統、Result 境界、Server vs Client）
2. **失敗モードまで設計する**（部分失敗、マルチインスタンス、E2E の CI）
3. **すでに書いた docs を記事の一次ソースにする**（新規にネタを探す必要は薄い）
4. **基礎は「このリポジトリで使っている順」に埋める**（`useCallback` より `useActionState` / `async` / Cookie）

以上。
