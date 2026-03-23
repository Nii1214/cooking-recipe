# Git ブランチ運用ガイド（VSCode / Cursor / GitHub GUI 向け）

## 概要

本プロジェクトでは **Git Flow** をベースにしたブランチ運用を行います。  
このドキュメントでは、VSCode・Cursor・GitHub の GUI を使った操作手順と、コンフリクトを防ぐための正しい運用方法を説明します。

---

## ブランチ構成

| ブランチ | 役割 | デプロイ先 |
|----------|------|------------|
| **main** | 本番環境用。安定したコードのみ | 本番環境 |
| **develop** | 検証環境用。次回リリース候補 | 検証環境 |
| **feature/〇〇** | 機能開発用。develop から分岐 | なし（ローカル開発） |

```
main ─────────●─────────────────●─────────────────● (本番リリース)
              ↑                 ↑                 ↑
              │                 │                 │
develop ──●───┴───●───●───●─────┴───●───●─────────┴── (検証環境)
          ↑       ↑       ↑         ↑       ↑
          │       │       │         │       │
feature/A ┴───────┘       │         │       │
feature/B ────────────────┴─────────┘       │
feature/C ──────────────────────────────────┘
```

---

## 重要：マージの方向

### ✅ 正しいマージの方向

| マージ元 | マージ先 | タイミング |
|----------|----------|------------|
| **feature/〇〇** | **develop** | 機能開発が完了したとき |
| **develop** | **main** | 本番リリースするとき |

### ❌ やってはいけないマージの方向

| マージ元 | マージ先 | 問題点 |
|----------|----------|--------|
| **main** | **develop** | コンフリクトの原因。main の hotfix を develop に取り込みたい場合は別の方法を使う |
| **main** | **feature/〇〇** | 同上 |
| **develop** | **feature/〇〇** | feature ブランチが古い場合は rebase を使う |

---

## コンフリクトが発生する原因と対策

### よくある原因 1：main を develop にマージしてしまう

```
# ❌ これはやらない
git checkout develop
git merge main  # main → develop のマージは NG
```

**なぜ問題か**：  
main と develop で同じファイルを別々に編集していた場合、マージ時にコンフリクトが発生します。  
また、main にしか存在しない hotfix が develop に入り込み、履歴が複雑になります。

**対策**：  
main で hotfix を行った場合は、hotfix ブランチを作成し、main と develop の両方に PR を出す（後述）。

---

### よくある原因 2：古い feature ブランチをマージしようとする

```
# feature/A を develop から作成
# その後、develop に feature/B, feature/C がマージされた
# feature/A をマージしようとするとコンフリクト発生
```

**対策**：  
feature ブランチで作業中に develop が進んだ場合は、定期的に develop の変更を取り込む。

---

## 操作手順

### 1. feature ブランチを作成する

#### VSCode / Cursor での操作

1. 画面左下のブランチ名をクリック
2. 「新しいブランチを作成...」を選択
3. ブランチ名を入力（例：`feature/add-login-form`）
4. 「develop から作成」を選択

#### コマンドでの操作

```bash
# develop ブランチに切り替え
git checkout develop

# develop を最新に更新
git pull origin develop

# feature ブランチを作成して切り替え
git checkout -b feature/add-login-form
```

---

### 2. feature ブランチで作業する

通常どおりコードを編集し、コミットします。

#### VSCode / Cursor での操作

1. ファイルを編集
2. 左サイドバーの「ソース管理」アイコンをクリック
3. 変更したファイルの「+」をクリックしてステージング
4. コミットメッセージを入力して「✓」をクリック

#### コマンドでの操作

```bash
git add .
git commit -m "feat: ログインフォームを追加"
```

---

### 3. feature ブランチを develop にマージする（PR 経由）

#### 手順 1：feature ブランチをリモートにプッシュ

**VSCode / Cursor での操作**

1. 画面左下のブランチ名の横にある「↑」（同期）をクリック
2. または「ソース管理」→「...」→「プッシュ」

**コマンドでの操作**

```bash
git push -u origin feature/add-login-form
```

#### 手順 2：GitHub で Pull Request を作成

1. GitHub リポジトリページを開く
2. 「Compare & pull request」ボタンが表示されるのでクリック
3. **base: develop** ← **compare: feature/add-login-form** になっていることを確認
4. タイトルと説明を入力
5. 「Create pull request」をクリック

#### 手順 3：レビュー後にマージ

1. CI（Lint・テスト）が通ることを確認
2. 「Merge pull request」をクリック
3. 「Confirm merge」をクリック

#### 手順 4：ローカルを更新

```bash
git checkout develop
git pull origin develop
```

---

### 4. develop を main にマージする（本番リリース）

#### GitHub での操作

1. GitHub リポジトリページを開く
2. 「Pull requests」タブ →「New pull request」
3. **base: main** ← **compare: develop** を選択
4. 「Create pull request」をクリック
5. レビュー後、「Merge pull request」→「Confirm merge」

#### ローカルを更新

```bash
git checkout main
git pull origin main
git checkout develop
git pull origin develop
```

---

### 5. develop の最新を feature ブランチに取り込む（rebase）

feature ブランチで作業中に develop が進んだ場合、以下の方法で最新を取り込みます。

#### VSCode / Cursor での操作（マージで取り込む簡易版）

1. develop ブランチに切り替え
2. プルして最新にする
3. feature ブランチに戻る
4. コマンドパレット（Cmd+Shift+P / Ctrl+Shift+P）→「Git: Merge Branch...」
5. `develop` を選択

#### コマンドでの操作（rebase 推奨）

```bash
# feature ブランチにいる状態で
git fetch origin
git rebase origin/develop

# コンフリクトがあれば解消し
git add .
git rebase --continue

# 強制プッシュ（rebase 後は履歴が変わるため）
git push -f origin feature/add-login-form
```

> ⚠️ **注意**：`git push -f` は自分だけが作業している feature ブランチでのみ使用してください。他の人と共有しているブランチでは使用しないでください。

---

## 緊急修正（Hotfix）の運用

本番環境で緊急のバグが見つかった場合の対応方法です。

### Hotfix ブランチの作成とマージ

```bash
# main から hotfix ブランチを作成
git checkout main
git pull origin main
git checkout -b hotfix/fix-critical-bug

# 修正をコミット
git add .
git commit -m "fix: 〇〇のバグを修正"

# リモートにプッシュ
git push -u origin hotfix/fix-critical-bug
```

### GitHub で PR を 2 つ作成

1. **hotfix/fix-critical-bug → main** の PR を作成してマージ
2. **hotfix/fix-critical-bug → develop** の PR を作成してマージ

こうすることで、main と develop の両方に修正が反映され、コンフリクトを防げます。

---

## コンフリクトが発生したときの対処法

### VSCode / Cursor での解消手順

1. コンフリクトが発生すると、該当ファイルに以下のようなマーカーが表示されます：

```
<<<<<<< HEAD
現在のブランチの内容
=======
マージしようとしているブランチの内容
>>>>>>> feature/xxx
```

2. VSCode では各セクションの上に「Accept Current Change」「Accept Incoming Change」「Accept Both Changes」「Compare Changes」のボタンが表示されます
3. 適切な選択肢をクリック、または手動で編集
4. マーカー（`<<<<<<<`, `=======`, `>>>>>>>`）を削除
5. ファイルを保存
6. ステージングしてコミット

### GitHub Web UI での解消手順

1. PR ページで「Resolve conflicts」ボタンをクリック
2. 競合箇所が表示されるので、手動で編集
3. 「Mark as resolved」をクリック
4. 「Commit merge」をクリック

---

## ブランチ運用チェックリスト

### feature ブランチを作成するとき

- [ ] develop ブランチが最新になっているか確認した
- [ ] develop から feature ブランチを作成した
- [ ] ブランチ名は `feature/〇〇` の形式になっている

### PR を作成するとき

- [ ] マージ先が正しいか確認した（feature → develop, develop → main）
- [ ] CI が通っているか確認した
- [ ] コンフリクトがないか確認した

### マージするとき

- [ ] main から develop へのマージは**しない**
- [ ] hotfix の場合は main と develop の両方に PR を作成する
- [ ] マージ後、ローカルの develop/main を pull で更新する

---

## よくある質問

### Q. main と develop が乖離してしまった場合はどうする？

develop を main にマージする PR を作成し、コンフリクトを解消してマージします。  
main を develop にマージするのではなく、develop を main にマージする方向で解決してください。

### Q. 間違えて main を develop にマージしてしまった場合は？

すでにリモートにプッシュしていない場合：

```bash
git checkout develop
git reset --hard origin/develop
```

すでにプッシュしてしまった場合は、revert コミットを作成するか、チームメンバーと相談して対応してください。

### Q. feature ブランチを作り忘れて main で作業してしまった場合は？

```bash
# まだコミットしていない場合
git stash
git checkout develop
git checkout -b feature/new-feature
git stash pop

# すでにコミットしてしまった場合
git branch feature/new-feature  # 現在の状態で feature ブランチを作成
git checkout main
git reset --hard origin/main    # main をリモートの状態に戻す
git checkout feature/new-feature
```

### Q. GitHub の「Squash and merge」と「Merge commit」の違いは？

| 方法 | 説明 | 推奨ケース |
|------|------|------------|
| **Merge commit** | すべてのコミットがそのまま残る | 履歴を残したい場合 |
| **Squash and merge** | 複数コミットが 1 つにまとまる | 細かいコミットを整理したい場合 |
| **Rebase and merge** | 直線的な履歴になる | 履歴をきれいに保ちたい場合 |

本プロジェクトでは **Squash and merge** を推奨します（feature → develop のマージ時）。

---

## 関連ドキュメント

- [GitHub Actions ワークフローの導入](./github-actions-workflow.md)
- [GitHub Actions のドキュメント](https://docs.github.com/ja/actions)
- [Git Flow について](https://nvie.com/posts/a-successful-git-branching-model/)
