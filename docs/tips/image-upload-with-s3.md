# 画像アップロード（AWS S3）の設定と導入手順

## 概要

レシピのサムネイル画像は **AWS S3** に保存します。
データベースには画像の **パスのみ** を保存し、表示時にコードで URL を生成します。

```
DB に保存するもの: recipes/user-id/uuid.jpg   ← パス
表示時に生成:       https://bucket.s3.ap-northeast-1.amazonaws.com/recipes/user-id/uuid.jpg   ← URL
```

こうすることで、将来 S3 直接 URL → CloudFront（CDN）に切り替える場合でも、
環境変数 `NEXT_PUBLIC_IMAGE_BASE_URL` の値を変えるだけで全画像の URL が一括変更されます。

---

## アップロードの仕組み（プレサインド URL）

ブラウザから直接 S3 にアップロードする際、AWS の認証情報（アクセスキー）を
クライアント（ブラウザ）に渡してはいけません。

そこで **プレサインド URL** という仕組みを使います。

```
① ブラウザ → Next.js サーバー  : 「アップロード用の URL をください」
② Next.js サーバー → S3       : 「このファイルを PUT できる一時 URL を発行して」
③ S3 → Next.js サーバー       : 「https://s3.../... という URL を5分間だけ有効にしました」
④ Next.js サーバー → ブラウザ  : 「この URL に直接アップロードしてください」
⑤ ブラウザ → S3               : 「（受け取った URL に画像を直接 PUT する）」
```

AWS の認証情報はサーバーの環境変数にのみ存在し、ブラウザには届きません。

---

## PART 1: AWS の設定手順

### 1-1. AWS アカウントを作成する

1. https://aws.amazon.com/jp/ にアクセスして「AWS を無料で始める」をクリック
2. メールアドレス・パスワード・クレジットカード情報を入力して登録

> **注意**: S3 には無料枠（5GB・20,000 リクエスト/月）がありますが、超過すると課金されます。

---

### 1-2. S3 バケットを作成する

1. AWS コンソール（https://console.aws.amazon.com）にログイン
2. 上部の検索バーで「S3」と入力 → **S3** をクリック
3. 「**バケットを作成**」をクリック
4. 以下を設定する

   | 設定項目 | 値 |
   |---|---|
   | バケット名 | 任意（例: `my-cooking-recipe-images`）※グローバルで一意な名前にする |
   | AWS リージョン | `アジアパシフィック (東京) ap-northeast-1` |
   | オブジェクト所有者 | `ACL 無効（推奨）` |
   | パブリックアクセスのブロック | **すべてのブロックを外す**（画像を公開するため） |
   | バージョニング | 無効 |
   | 暗号化 | デフォルト（SSE-S3）のまま |

5. 「**バケットを作成**」をクリック

---

### 1-3. バケットポリシーを設定する（公開読み取りを許可）

1. 作成したバケットをクリック → 「**アクセス許可**」タブ
2. 「**バケットポリシー**」の「編集」をクリック
3. 以下の JSON を貼り付ける（`YOUR-BUCKET-NAME` を実際のバケット名に変更）

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

4. 「**変更の保存**」をクリック

> これにより、バケット内の全ファイルが URL を知っていれば誰でも閲覧できるようになります。
> アップロード（PUT）は後述の IAM ユーザーのみが行えます。

---

### 1-4. CORS を設定する（ブラウザからの直接アップロードを許可）

プレサインド URL を使ったブラウザからの直接アップロードには CORS 設定が必要です。

1. 同じバケットの「**アクセス許可**」タブ
2. 「**クロスオリジンリソース共有 (CORS)**」の「編集」をクリック
3. 以下の JSON を貼り付ける

```json
[
  {
    "AllowedHeaders": ["Content-Type"],
    "AllowedMethods": ["PUT"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-production-domain.com"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

> `AllowedOrigins` の `https://your-production-domain.com` は本番ドメインに変更してください。

4. 「**変更の保存**」をクリック

---

### 1-5. IAM ユーザーを作成して認証情報を取得する

AWS コンソールが直接操作できる「マスターアカウント」の認証情報をアプリに使うのは危険です。
S3 への書き込みのみ許可した専用 IAM ユーザーを作成します。

#### IAM ユーザーの作成

1. 検索バーで「IAM」→ **IAM** をクリック
2. 左メニュー「**ユーザー**」→「**ユーザーを作成**」
3. ユーザー名を入力（例: `cooking-recipe-app`）
4. 「**次のステップ: 許可**」をクリック
5. 「**ポリシーを直接アタッチする**」を選択
6. 「**ポリシーを作成**」をクリック（新しいタブで開く）

#### カスタムポリシーの作成

7. 「**JSON**」タブをクリックして以下を貼り付ける（`YOUR-BUCKET-NAME` を変更）

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
    }
  ]
}
```

8. ポリシー名を入力（例: `cooking-recipe-s3-write`）→「**ポリシーを作成**」
9. ユーザー作成のタブに戻り、作成したポリシーを検索してチェック
10. 「**次のステップ**」→「**ユーザーを作成**」

#### アクセスキーの発行

11. 作成したユーザーをクリック → 「**セキュリティ認証情報**」タブ
12. 「**アクセスキーを作成**」をクリック
13. 「**アプリケーションの実行**」を選択 → 「**次へ**」→「**アクセスキーを作成**」
14. **アクセスキー ID** と **シークレットアクセスキー** を安全な場所にコピーする

> ⚠️ シークレットアクセスキーはこの画面でしか確認できません。必ずコピーしてください。

---

## PART 2: アプリの設定手順

### 2-1. 環境変数を設定する

`.env.local` に以下を追記します（`.env.local.example` を参考にしてください）。

```env
# AWS S3
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=取得したアクセスキーID
AWS_SECRET_ACCESS_KEY=取得したシークレットアクセスキー
AWS_S3_BUCKET_NAME=作成したバケット名

# 画像の公開ベース URL
NEXT_PUBLIC_IMAGE_BASE_URL=https://作成したバケット名.s3.ap-northeast-1.amazonaws.com
```

> `AWS_ACCESS_KEY_ID` と `AWS_SECRET_ACCESS_KEY` はサーバーサイドの変数です。
> `NEXT_PUBLIC_` プレフィックスをつけないことでブラウザには公開されません。

---

### 2-2. 動作確認

1. 開発サーバーを起動

   ```bash
   npm run dev
   ```

2. レシピ登録画面（`/recipe/new`）を開く

3. 画像を選択してレシピを登録する

4. 登録後のレシピ詳細画面でサムネイル画像が表示されることを確認する

5. AWS コンソール → S3 → バケット内に `recipes/{userId}/{uuid}.jpg` のパスでファイルが作成されていることを確認する

---

## PART 3: 実装の概要（コードリーディング用）

実装がどのファイルに分散しているかを整理します。

### ファイル構成

```
src/
├── lib/
│   └── image.ts                              # getImageUrl() - パス → URL 変換
├── infrastructure/
│   └── storage/
│       └── upload-recipe-image.ts            # S3 へのファイルアップロード（クライアント）
└── app/
    └── recipe/
        └── new/
            ├── get-upload-url-action.ts      # プレサインド URL を発行する Server Action
            └── action.ts                     # DB 保存（thumbnailPath を受け取る）
```

### URL 生成（`src/lib/image.ts`）

```ts
const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? "";

export function getImageUrl(path: string): string {
  return `${BASE_URL}/${path}`;
}
```

表示コンポーネントでは `recipe.thumbnailPath` に対してこの関数を呼びます。

```tsx
{recipe.thumbnailPath && (
  <img src={getImageUrl(recipe.thumbnailPath)} alt={recipe.title} />
)}
```

### DB のカラムについて

`recipes` テーブルの `thumbnail_url` カラムには、フルの URL ではなく **パス** を保存します。
カラム名が `thumbnail_url` のままなのは DB のスキーマ変更コストを避けるためで、
ドメインモデルでは `thumbnailPath` という名前で扱います。

| 場所 | フィールド名 | 値の例 |
|---|---|---|
| DB（`recipes` テーブル） | `thumbnail_url` | `recipes/user-id/uuid.jpg` |
| ドメインモデル（`Recipe`, `RecipeSummary`） | `thumbnailPath` | `recipes/user-id/uuid.jpg` |
| 表示時（`getImageUrl` 呼び出し後） | ― | `https://bucket.s3.../recipes/user-id/uuid.jpg` |

---

## PART 4: 将来 CloudFront を導入する場合

CloudFront は AWS の CDN（コンテンツ配信ネットワーク）です。
S3 の前段に置くことで画像の配信が高速になります。

切り替えに必要な作業は **環境変数 1 箇所の変更のみ** です。

```env
# 変更前（S3 直接）
NEXT_PUBLIC_IMAGE_BASE_URL=https://my-bucket.s3.ap-northeast-1.amazonaws.com

# 変更後（CloudFront 経由）
NEXT_PUBLIC_IMAGE_BASE_URL=https://xxxxxxxxxx.cloudfront.net
```

コードの変更は一切不要です。
