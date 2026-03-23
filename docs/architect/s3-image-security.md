# S3 画像セキュリティ設計

## 背景・課題

レシピのサムネイル画像として家族の写真なども掲載予定のため、  
**URL を知っていれば誰でも閲覧できる状態は避けたい**という要件が生まれた。

当初の実装は S3 バケットをパブリック公開する前提で設計されており、以下のバケットポリシーが設定されていた。

```json
{
  "Effect": "Allow",
  "Principal": "*",
  "Action": "s3:GetObject"
}
```

この状態では画像の URL さえわかれば認証なしに誰でも閲覧できるため、要件を満たせない。

---

## 採用する設計：プレサインド URL（読み取り用）

### 考え方

アップロード時（PUT）にすでに採用しているプレサインド URL の仕組みを、  
**表示時（GET）にも適用する**。

```
変更前: パス → 静的 URL（誰でもアクセス可）
変更後: パス → サーバーで一時 URL 生成（有効期限付き）→ img src に渡す
```

### プレサインド URL の仕組み（再掲）

```
URL の構造:
https://bucket.s3.amazonaws.com/recipes/abc/photo.jpg   ← パス部分（不変）
  ?X-Amz-Algorithm=AWS4-HMAC-SHA256
  &X-Amz-Expires=3600
  &X-Amz-Signature=xxxxxxx                              ← 署名（毎回変わる）
```

S3 上のファイルの場所は変わらず、「この場所への 1 時間限定アクセス権」を都度発行するイメージ。

### メリット

- S3 バケットを完全非公開にできる
- URL が期限切れになるため、漏洩しても被害が限定的
- 追加コストなし

### デメリット

- 画像 URL が毎回変わる（直接 URL をシェアできない）
- 画像表示がサーバーサイドの処理を伴う（非同期）

---

## DB 設計への影響

**DB に保存するのは変わらず「パス」のみ**。変わるのは表示時の URL 生成方法だけ。

| 場所 | 内容 | 変更有無 |
|---|---|---|
| DB（`recipes.thumbnail_url`） | `recipes/user-id/uuid.jpg` | **なし** |
| ドメインモデル（`thumbnailPath`） | `recipes/user-id/uuid.jpg` | **なし** |
| 表示時の URL | プレサインド URL（有効期限付き） | **あり** |

---

## コード変更の方針

### 削除・変更するもの

| ファイル | 変更内容 |
|---|---|
| `src/lib/image.ts` | `getImageUrl()` を削除 → サーバー専用の非同期関数に置き換え |
| `.env.local` | `NEXT_PUBLIC_IMAGE_BASE_URL` を削除（不要になる） |

### 変更のイメージ

```ts
// 変更前（クライアント、同期、環境変数依存）
export function getImageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${path}`;
}

// 変更後（サーバー専用、非同期、AWS SDK 使用）
export async function getPresignedImageUrl(path: string): Promise<string> {
  const url = await getSignedUrl(s3Client, new GetObjectCommand({ Bucket, Key: path }), {
    expiresIn: 3600, // 1 時間
  });
  return url;
}
```

この関数は AWS の秘密鍵が必要なため、**Server Component または Server Action からのみ呼び出す**。

---

## AWS 側の変更内容

### 1. パブリックアクセスをブロック

S3 コンソール → バケット → アクセス許可 → 「パブリックアクセスをすべてブロック」を **4 つすべて ON**

### 2. バケットポリシーを削除

現在設定している `Principal: "*"` の `s3:GetObject` ポリシーを**削除**する。

### 3. IAM ユーザーポリシーに GetObject を追加

プレサインド GET URL の発行には `s3:GetObject` 権限が必要。

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:PutObject",
    "s3:DeleteObject",
    "s3:GetObject"
  ],
  "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
}
```

---

## 将来 CloudFront を導入する場合

CloudFront 署名付き URL（Signed URL）または署名付き Cookie を使う構成に移行できる。  
この場合も S3 へのアクセスは完全非公開のまま維持される。

現時点では個人・家族向けの用途のためプレサインド URL で十分。  
アクセス増加・海外展開が発生した時点で CloudFront の導入を検討する。
