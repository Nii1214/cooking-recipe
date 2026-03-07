# GitHub Actions ワークフローの導入

## 概要

GitHub Actions で **Lint** と **テスト** を PR や push 時に自動実行する手順です。  
本プロジェクトのブランチ運用（**main ← develop ← feature/〇〇**）に合わせて、`main` と `develop` の両方で CI が走るようにします。

本プロジェクトでは次のコマンドを CI で実行します。

| コマンド | 説明 |
|----------|------|
| `npm run lint` | ESLint でコード品質チェック |
| `npm run test:run` | Vitest で単体テストを 1 回実行 |

---

## 前提条件

| 項目 | 備考 |
|------|------|
| リポジトリが GitHub でホストされている | GitHub Actions は GitHub の機能のため |
| Node.js 20.x を CI で使用する | 本プロジェクトの推奨環境に合わせる |

---

## ディレクトリ構成（導入後）

ワークフロー用のファイルを 1 つ追加します。

```
cooking-recipe/
├── .github/
│   └── workflows/
│       └── ci.yml          # Lint とテストを実行するワークフロー
├── package.json
└── ...
```

---

## セットアップ手順

### 1. ワークフローディレクトリを作成する

プロジェクトルートで次を実行します。

```bash
mkdir -p .github/workflows
```

---

### 2. ワークフローファイルを作成する

`.github/workflows/ci.yml` を新規作成し、以下の内容を保存します。

```yaml
name: CI

on:
  # main および develop への push / それらへの PR で実行（運用: main ← develop ← feature/〇〇）
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run lint
        run: npm run lint

      - name: Run tests
        run: npm run test:run
```

---

### 3. 各ステップの説明

| ステップ | 説明 |
|----------|------|
| **Checkout** | リポジトリのコードを取得する |
| **Setup Node.js** | Node.js 20 をセットアップし、`npm` のキャッシュを有効にしてインストールを高速化する |
| **Install dependencies** | `npm ci` で `package-lock.json` に合わせて依存関係をインストールする（再現性のため `npm install` ではなく `npm ci` を使用） |
| **Run lint** | ESLint を実行する。エラーがあるとジョブが失敗する |
| **Run tests** | Vitest でテストを 1 回実行する。失敗するとジョブが失敗する |

---

### 4. ブランチ運用（main ← develop ← feature/〇〇）の場合

本プロジェクトでは **main ← develop ← feature/〇〇** の運用をしているため、CI は次のように動かします。

- **develop** と **main** の両方で CI を走らせる  
  → `feature/〇〇` を `develop` にマージする前、および `develop` を `main` にマージする前にチェックが入る
- ワークフローの `branches` に `[main, develop]` を指定する（手順 2 の YAML のとおり）

これで次が実行されます。

| トリガー | 動作 |
|----------|------|
| **develop** への push | ワークフローが実行される |
| **develop** 向けの Pull Request（feature/〇〇 → develop） | PR 作成・更新のたびに実行され、PR にチェック結果が表示される |
| **main** への push | ワークフローが実行される |
| **main** 向けの Pull Request（develop → main） | PR 作成・更新のたびに実行される |

---

## いつ実行されるか

| トリガー | 動作 |
|----------|------|
| **develop** への **push** | ワークフローが実行される。失敗すると GitHub の Actions タブに表示される |
| **develop** 向けの **Pull Request**（feature/〇〇 → develop） | PR 作成・更新のたびに実行され、PR の画面にチェック結果が表示される |
| **main** への **push** | ワークフローが実行される |
| **main** 向けの **Pull Request**（develop → main） | PR 作成・更新のたびに実行される |

---

## 動作確認

### 1. ファイルをコミットして push する

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for lint and test"
git push origin <あなたのブランチ名>
```

### 2. GitHub で結果を確認する

- リポジトリの **Actions** タブを開く
- 直近のワークフロー実行が表示される
- 緑のチェックマークなら成功、赤の×なら失敗

### 3. 意図的に失敗させてみる（任意）

- ソースコードに ESLint エラーを入れて push する → **Run lint** が失敗する
- テストを 1 つ失敗するように変更して push する → **Run tests** が失敗する

---

## よくある質問・トラブルシューティング

### Q. `npm run lint` で「No files matching the pattern」などと出る

ESLint の対象パスが指定されていない場合があります。  
`package.json` の `lint` スクリプトを次のように変更してみてください。

```json
"lint": "eslint ."
```

または、Next.js の推奨どおり次のようにします。

```json
"lint": "next lint"
```

（本プロジェクトでは `eslint` のみのため、上記のいずれかに変更後、ローカルで `npm run lint` が通ることを確認してから push してください。）

---

### Q. テストで環境変数が必要な場合

Supabase の URL やキーを使うテストは、CI ではモックを使うか、GitHub の **Secrets** に登録した値を `env` で渡します。  
本プロジェクトの既存テストは Supabase に直接依存しない設計のため、そのままで動作する想定です。

Secrets を使う場合は、ワークフローに次のように追加します。

```yaml
- name: Run tests
  run: npm run test:run
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

Secrets はリポジトリの **Settings → Secrets and variables → Actions** で登録します。

---

### Q. PR で「マージする前にチェックを通したい」ようにしたい

GitHub の **Branch protection rules** で、「Status checks が通るまでマージ不可」にできます。

**main ← develop 運用の場合**  
`develop` と `main` の両方にルールを設定すると、feature → develop および develop → main のどちらの PR も、CI が通るまでマージできなくなります。

1. リポジトリの **Settings → Branches → Add rule**
2. Branch name pattern に `main` または `develop` を指定（それぞれ 1 ルールずつ追加可能）
3. **Require status checks to pass before merging** にチェック
4. **Require branches to be up to date before merging** は任意
5. Status の候補に **lint-and-test**（ジョブ名）が出るので選択して保存

これで、CI が失敗している PR はマージできなくなります。

---

### Q. `npm ci` で失敗する

`package-lock.json` がリポジトリに含まれていないと `npm ci` は失敗します。  
必ず `package-lock.json` をコミットして push してください。

---

## 関連ドキュメント

- [GitHub Actions のドキュメント](https://docs.github.com/ja/actions)
- [actions/checkout](https://github.com/actions/checkout)
- [actions/setup-node](https://github.com/actions/setup-node)
- 本リポジトリの [スキル偏差値向上の取り組み](../reviews/skill-deviation-up.md)（CI 導入は「影響度：中」として記載）
