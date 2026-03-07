# 家族の味と思い出を一緒に残す『ファミリー味帳』

<!-- デモ URL が確定したらここに記載してください -->
<!-- 🔗 [デモを見る](https://your-app.vercel.app) -->

**Tech Stack**:
Next.js 16 &nbsp;|&nbsp; React 19 &nbsp;|&nbsp; TypeScript &nbsp;|&nbsp; Supabase &nbsp;|&nbsp; Tailwind CSS v4 &nbsp;|&nbsp; Vercel

---

## Overview

Family Recipe Archive は、  
「家族の味と記憶を保存・継承するためのクローズドなレシピアプリ」です。

単なるレシピ管理ツールではなく、

- 家族の思い出
- 失敗も含めた料理体験
- 写真とともに残す日常
- 世代を超えた味の継承

を目的としたプロダクトです。

---

## Why This Product Exists

料理は、誰しもが関わる営みです。

しかし、

- 結婚や引越しで家族が疎遠になる
- 親世代が亡くなり、味が再現できなくなる
- 離乳食などセンシティブなレシピを安全に共有したい

といった課題があります。

本プロダクトは、

> 「料理」という共通体験を通じて、  
> 家族のつながりを保存・再構築すること

を目的としています。

---

## Core Concept

### 1. Closed Environment

本アプリは家族単位で完全に分離された空間を提供します。

- 他家族のデータにはアクセス不可
- 家族単位でデータを管理
- センシティブな内容（離乳食など）も安心して保存可能

安心を最優先に設計しています。

---

### 2. Family-Owned Data

レシピは「個人の所有物」ではなく  
「家族の資産」として扱います。

- レシピの所有者は内部家族
- 個人死亡による断絶を防ぐ設計
- 招待済み家族には継続的にアクセス可能

家族全員が亡くなった場合の削除は想定しますが、  
基本思想は「保存」です。

---

### 3. Memory-Oriented Design

保存できるもの：

- レシピ
- 失敗談
- 思い出エピソード
- 写真
- 将来的にはコメント機能

料理越しに孫の写真を見る、  
教えてもらったレシピを再現する、  
そんなコミュニケーションを想定しています。

---

## Architecture

### Tech Stack

| カテゴリ | 技術 | 選定理由 |
|--------|-----|---------|
| フレームワーク | Next.js 16（App Router） | Server Actions による型安全なサーバー処理 |
| UI | React 19 + Tailwind CSS v4 + shadcn/ui | 高速な UI 開発と一貫したデザイン |
| 言語 | TypeScript | 型安全性、エディタ補完によるDX向上 |
| BaaS | Supabase（PostgreSQL + Auth + Storage） | RLS によるマルチテナント対応、コスト効率 |
| ホスティング | Vercel | Next.js との親和性、エッジデプロイ |
| テスト | Vitest | 高速なユニットテスト、TypeScript ネイティブ |

各技術の選定詳細は [`docs/adr/`](./docs/adr/) を参照してください。

---

### ディレクトリ構成

クリーンアーキテクチャに基づいて層ごとに分離しています。

```
src/
├── app/              # Next.js App Router（ルーティング・Server Actions）
├── presentation/     # UI コンポーネント
├── usecase/          # ユースケース（機能のオーケストレーション）
├── domain/
│   ├── models/       # エンティティ・値オブジェクト（型）
│   └── repositories/ # リポジトリのインターフェース（契約）
├── infrastructure/
│   └── repositories/ # リポジトリの実装（Supabase を使った永続化）
├── lib/              # 外部クライアントのラッパー（Supabase 等）
├── types/            # アプリ全体で使う型（Result 型など）
├── utils/            # プレーンなユーティリティ（バリデーション等）
└── constants/        # 定数（エラーメッセージ等）
```

各層の詳細なルールと設計意図は、各ディレクトリの `_README.md` に記載しています。

---

### Architectural Principles

#### 1. Clean Architecture

- Domain 層を中心に設計
- UseCase 層でビジネスロジック管理
- Infrastructure 層で Supabase 依存を隔離
- Server Action は UseCase 呼び出しのみ

将来的な技術変更に耐えられる構造を採用しています。

> アーキテクチャの全体図・依存関係・CRUD フローの詳細:  
> → [`docs/architect/clean-architecture-and-directory.md`](./docs/architect/clean-architecture-and-directory.md)

---

#### 2. Multi-Tenant Design

- `family_id` によるデータ分離
- Supabase RLS によるアクセス制御
- ドメイン層での整合性チェック（二重防御）

セキュリティをインフラとドメインの両方で担保しています。

---

#### 3. Storage Strategy

画像データは長期保存を前提とします。

- 将来的なストレージ移行を考慮した抽象化
- 画像最適化
- エクスポート機能の実装予定

---

## Getting Started（開発環境のセットアップ）

### 必要なもの

- Node.js 20+
- Supabase プロジェクト（[supabase.com](https://supabase.com) で無料作成可能）

### 手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/your-username/cooking-recipe.git
cd cooking-recipe

# 2. 依存パッケージをインストール
npm install

# 3. 環境変数を設定
cp .env.example .env.local
# .env.local に以下を記入してください:
#   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 4. 開発サーバーを起動
npm run dev
```

### テストの実行

```bash
# ウォッチモードでテスト
npm run test

# 一度だけ実行
npm run test:run
```

---

## Data Permanence Strategy

本プロダクトは「Write Once, Read Forever」型の設計です。

考慮していること：

- バックアップ戦略
- PDF エクスポート機能
- 将来的な JSON エクスポート
- サービス終了時のデータ持ち出し可能性

ユーザーのデータ主権を重視します。

---

## Monetization Policy

テーマの特性上、慎重に設計します。

基本方針：

- データ販売は行わない
- 行動トラッキング広告は行わない
- 信頼を損なう収益化はしない

検討中：

- 家族単位の保存料モデル
- ストレージ容量課金
- PDF 製本オプション

収益よりも「信頼」を優先します。

---

## Future Vision

スケールは目的ではありません。

- 小さくても長く続くこと
- ドメインは極力変更しない
- 開発者がいなくなっても継承可能な設計

を目指しています。

---

## Author's Intent

このプロダクトは、

- 技術的挑戦
- 長期設計の実験
- 永続性と倫理の両立

を目的としたプロジェクトでもあります。

家族の味は、消耗品ではなく「記憶資産」である。

それを守るための設計を行っています。
