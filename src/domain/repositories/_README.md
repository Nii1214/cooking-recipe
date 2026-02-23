# `src/domain/repositories`について

## 概要
このディレクトリは以下の役割がある。
- **リポジトリのインターフェース（契約）の定義** … 永続化・外部サービスとのやりとりに必要な操作を型として宣言する
- **リポジトリ専用の型の定義** … メソッドの引数・戻り値用の入出力 DTO などをここに置く。エンティティは `src/domain/models/` に定義し、必要に応じてここから参照する
- **依存性の逆転** … ユースケース層はこのインターフェースにのみ依存し、実装（インフラ層）に依存しないようにする

## 配置方針
- このディレクトリには **インターフェースと型のみ** を置き、具体的な実装（DB アクセス・API 呼び出しなど）は置かない
- 実装は `src/infrastructure/repositories/` に配置する
- エンティティなどドメインモデルは `src/domain/models/` に置き、リポジトリの契約（戻り値など）ではその型を利用する

## 命名規則
- ファイル名: `{関心事}-repository.ts`（例: `auth-repository.ts`）
- インターフェース名: `{関心事}Repository`（例: `AuthRepository`）

## 依存のルール（クリーンアーキテクチャの観点）

ドメイン層は最内層のため、**外側の層やフレームワークに依存してはいけません**。  
TypeScript/JavaScript では「依存する」＝「import する」なので、実務的には次の import ルールで守ります。

### 依存してよいもの
- **このディレクトリ（`src/domain/repositories/`）内の他のファイル**  
  例: `import type { SomeType } from './other-repository'` のように、同じディレクトリ内の型のみ
- **`src/domain/models/`**  
  例: `import type { User } from '@/domain/models/user'` のように、ドメインモデル（エンティティなど）を参照してよい
- **TypeScript / JavaScript の組み込み**  
  `Date`, `Promise`, `string`, `number` などは import 不要でそのまま使用してよい

### 依存してはいけないもの
- **プロジェクト内の他層**
  - `@/infrastructure/*`
  - `@/usecase/*`
  - `@/app/*`
  - `@/lib/*`
  - `@/presentation/*`
  - `@/hooks/*`
  - `@/utils/*`
  - `@/types/*`
- **フレームワーク**  
  React, Next.js など
- **ランタイムの実装が入るパッケージ**  
  Supabase クライアント、HTTP クライアント、DB ドライバなど

## その他のやってはいけないこと
- **実装を書かない** … インターフェースと型のみを置く。DB アクセス・API 呼び出し・ファイル I/O はインフラ層に書く
- **契約にフレームワーク固有の型を載せない** … リポジトリのメソッドの引数・戻り値は、Next.js や Supabase に依存した型にしない。プレーンな型・このディレクトリで定義した型・`domain/models` の型だけを使う
- **インターフェースに実装の都合を漏らさない** … ログ・メトリクス・キャッシュの有無などは契約に含めず、「何ができるか」だけを表す

## コード例

エンティティは `src/domain/models/` に定義し、リポジトリでは入出力 DTO とインターフェースだけを置く書き方です。

```ts
// auth-repository.ts
import type { User } from "@/domain/models/user";

export type SignupInput = {
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export interface AuthRepository {
  signup(input: SignupInput): Promise<User>;
  login(input: LoginInput): Promise<User>;
}
```
