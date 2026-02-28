# クリーンアーキテクチャとディレクトリ構成

このドキュメントでは、本プロジェクトが採用しているクリーンアーキテクチャの考え方と、`src/` 以下のディレクトリ構成・**何をどこで呼ぶか**を図で整理する。

---

## 1. クリーンアーキテクチャの前提

### 1.1 依存の向き（依存性のルール）

**依存は常に内側向き**である。

- 外側の層は内側の層を「呼ぶ」「import する」ことができる。
- **内側の層は外側の層を import してはいけない。**

```
    外側 ──────────────────────────────────────────
           │
           │  依存してよい（外→内）
           ▼
    内側 ──────────────────────────────────────────
```

内側ほど「ビジネスルールやドメイン」に近く、外側ほど「DB・API・UI」に近い。  
内側が外側に依存すると、技術の差し替えやテストがしづらくなるため、このルールを守る。

### 1.2 本プロジェクトでの層の対応（外側 → 内側）

| 層（外側→内側） | 役割 | 本プロジェクトのディレクトリ |
|------------------|------|-----------------------------|
| フレームワーク・ドライバ | UI、HTTP、DB クライアント | Next.js（App Router）、`src/lib/`（Supabase 等） |
| インターフェースアダプタ | UI と usecase の橋渡し、永続化の**実装** | `src/app/`, `src/presentation/`, `src/infrastructure/` |
| アプリケーション（ユースケース） | アプリ固有のオーケストレーション | `src/usecase/` |
| エンティティ・ドメイン | ビジネスルール、型・契約 | `src/domain/`（`models/`, `repositories/` のインターフェース） |

- **domain** … 最内層。型・エンティティ・リポジトリの**インターフェース（契約）**のみ。  
- **usecase** … domain に依存。リポジトリは「インターフェース」にだけ依存し、**実装（infra）は import しない**。  
- **infrastructure** … domain のリポジトリ契約を**実装**する。Supabase 等を呼ぶ。  
- **app** … Server Actions やページ。usecase を呼び、必要なら **infra を組み立てて usecase に渡す（DI）**。  
- **presentation** … UI コンポーネント。app の Action 等を呼ぶ。

---

## 2. ディレクトリ構成と「何をどこで呼ぶか」

### 2.1 ディレクトリ一覧と責務

```
src/
├── app/                    # Next.js App Router（ルーティング・Server Actions）
├── presentation/          # UI コンポーネント
├── usecase/                # ユースケース（オーケストレーション）
├── domain/                 # ドメイン層
│   ├── models/             # エンティティ・値オブジェクト（型）
│   └── repositories/      # リポジトリのインターフェースと入出力型
├── infrastructure/         # 永続化・外部サービスの実装
│   ├── repositories/      # リポジトリの実装（Supabase 等）
│   └── utils/              # インフラ寄りのユーティリティ
├── lib/                    # 外部クライアントのラッパー（Supabase 等）
├── types/                  # アプリ全体で使う型（Result 型など）
├── utils/                  # プレーンなユーティリティ（バリデーション等）
└── constants/              # 定数（エラーメッセージ等）
```

### 2.2 依存関係の図（誰が誰を import してよいか）

```mermaid
flowchart TB
    subgraph outer["外側"]
        app["app/"]
        presentation["presentation/"]
        infrastructure["infrastructure/"]
    end

    subgraph middle["中間"]
        usecase["usecase/"]
    end

    subgraph inner["内側"]
        domain_models["domain/models/"]
        domain_repos["domain/repositories/"]
    end

    subgraph shared["共有・ユーティリティ"]
        lib["lib/"]
        types["types/"]
        utils["utils/"]
        constants["constants/"]
    end

    app --> usecase
    app --> infrastructure
    app --> lib
    app --> types
    app --> utils
    presentation --> app
    presentation --> types

    usecase --> domain_models
    usecase --> domain_repos
    usecase --> types
    usecase --> utils
    usecase --> constants

    infrastructure --> domain_models
    infrastructure --> domain_repos
    infrastructure --> lib

    domain_repos --> domain_models

    style inner fill:#e8f5e9
    style middle fill:#e3f2fd
    style outer fill:#fff3e0
```

- **domain** … 他層やフレームワークに依存しない（`domain/repositories` → `domain/models` のみ可）。  
- **usecase** … domain と types/utils/constants に依存。**infrastructure は import しない**（契約だけに依存し、実装は app から注入）。  
- **infrastructure** … domain と lib に依存。  
- **app** … usecase / infrastructure / lib 等を組み合わせ、**「誰を誰に渡すか」を決める**層。

---

## 3. 処理の流れ（何をどこで呼ぶか）

### 3.1 認証フロー（サインアップ）— DI を使うパターン

usecase はリポジトリの**インターフェース**だけに依存し、**実装は app 層で組み立てて渡す**。

```mermaid
sequenceDiagram
    participant User
    participant Page as app/(auth)/signup/page
    participant Form as presentation/signup-form
    participant Action as app/signup.action
    participant DI as lib/di-container
    participant UseCase as usecase/signup.usecase
    participant RepoInterface as domain/repositories
    participant RepoImpl as infrastructure/auth-repository-impl
    participant Lib as lib/supabase

    User->>Page: アクセス
    Page->>Form: フォーム表示
    User->>Form: 入力・送信
    Form->>Action: signupAction(formData)

    Action->>DI: getSignupUseCase()
    DI->>RepoImpl: new AuthRepositoryImpl()
    DI->>UseCase: new SignupUseCase(authRepository)
    DI-->>Action: useCase

    Action->>UseCase: execute({ email, password })
    UseCase->>UseCase: バリデーション(utils/validation)
    UseCase->>RepoInterface: authRepository.signup(input)
    Note over UseCase,RepoImpl: 実際は DI が渡した RepoImpl
    RepoImpl->>Lib: supabase.auth.signUp(...)
    Lib-->>RepoImpl: 結果
    RepoImpl-->>UseCase: User
    UseCase-->>Action: SignupResult

    Action->>Action: redirect or エラー整形(infrastructure/utils)
    Action-->>Form: SignupResult
```

- **app（Action）** … `DIContainer.getSignupUseCase()` で usecase を取得。中で `AuthRepositoryImpl` が生成され、`SignupUseCase` に渡っている。  
- **usecase** … `AuthRepository` の**型（契約）**だけを知っており、`signup(input)` を呼ぶ。infra を import していない。  
- **infrastructure** … `AuthRepository` を実装し、`lib/supabase` を呼ぶ。

### 3.2 レシピ作成フロー — 現状の呼び出し関係

現在の `create-recipe-usecase.ts` は **usecase が infrastructure を直接 import している**。  
クリーンアーキテクチャの依存ルールに厳密に従う場合は、認証と同様に「app 層で infra を組み立てて usecase に渡す」形にするとよい。

```mermaid
sequenceDiagram
    participant Caller as app または 呼び出し元
    participant UseCase as usecase/create-recipe-usecase
    participant DomainTypes as domain/models, domain/repositories
    participant Infra as infrastructure/repositories/recipe/*

    Caller->>UseCase: createRecipeUsecase(input)
    UseCase->>Infra: createRecipe(input)
    Infra->>DomainTypes: RecipeInput 等の型を参照
    Infra-->>UseCase: Recipe
    UseCase->>Infra: saveIngredients(recipe.id, input.ingredients)
    UseCase->>Infra: saveInstructions(recipe.id, input.instructions)
    UseCase-->>Caller: Recipe
```

- **現状** … usecase → infrastructure の直接依存がある（依存の向きが逆）。  
- **推奨** … 認証と同様に、usecase は「レシピ用リポジトリのインターフェース」だけに依存し、`createRecipe` / `saveIngredients` / `saveInstructions` の実装は app 層で渡す（関数の引数で deps を受け取る、または DI コンテナで渡す）。

### 3.3 一覧：どこから何を呼ぶか

| 呼び出す側 | 呼んでもよいもの | 呼んではいけないもの |
|------------|------------------|------------------------|
| **app/** | usecase, infrastructure, lib, types, utils | （最外層のため制限は主に「ビジネスロジックを書かない」など） |
| **presentation/** | app（Action 等）, types | usecase, infrastructure, domain |
| **usecase/** | domain/models, domain/repositories（インターフェースのみ）, types, utils, constants | infrastructure（実装）, app, presentation |
| **infrastructure/** | domain/models, domain/repositories, lib | usecase, app, presentation |
| **domain/repositories/** | domain/models, 同ディレクトリ内の型 | 上記以外のすべて（infra, usecase, app, lib 等） |
| **domain/models/** | 同ディレクトリ内の型のみ | 上記以外のすべて |

---

## 4. CRUD サンプルケース

CRUD の呼び出しは **参照（Read）** と **作成・更新・削除（CUD）** でパターンが分かれる。

- **参照** … 1 本の流れで「リポジトリの get/find を呼んで返す」だけ。副作用がない。
- **作成・更新・削除** … リポジトリの create / update / save / delete を呼び、データを変更する。作成は複数リポジトリを順に呼ぶケースがある。

**図について（依存関係の補足）**  
以下のシーケンス図では、usecase から「Repo」を呼ぶように描いているが、**usecase が依存しているのはリポジトリのインターフェース（契約）だけ**である。**impl（infrastructure の実装）は action が組み立てて usecase に渡す**ため、usecase は impl を import しない。図中で「実体は impl」と書いているのは「実行時に動くコードは infrastructure の実装」という意味で、**依存の向き**は usecase → domain の契約のみである。

以下はすべて **action → usecase → リポジトリ（インターフェース経由。実体は action が注入した impl）** の形で、action は usecase だけを呼び出す前提で描いている。

### 4.1 参照（Read）— レシピ 1 件取得

**流れ**: presentation が action を呼ぶ → action が usecase を呼ぶ → usecase がリポジトリの `getRecipeById` を 1 回呼んで結果を返す。

```mermaid
sequenceDiagram
    participant Form as presentation
    participant Action as app/recipe/[id]/action
    participant UseCase as usecase/get-recipe-usecase
    participant Repo as リポジトリ（契約）<br/>実体は action が注入した impl
    participant DB as lib/supabase

    Form->>Action: getRecipeAction(recipeId)
    Note over Action: usecase に repo を注入
    Action->>UseCase: getRecipeById(recipeId)
    UseCase->>Repo: getRecipeById(recipeId)
    Note over UseCase,Repo: usecase は契約にのみ依存
    Repo->>DB: from('recipes').select()...
    DB-->>Repo: data
    Repo-->>UseCase: Recipe
    UseCase-->>Action: Recipe
    Action-->>Form: Recipe or error
```

- **action** … usecase を呼ぶ前に、リポジトリの**実装（impl）**を組み立てて usecase に渡す（DI）。usecase は「契約」だけを知っている。
- **usecase** … `getRecipeById(recipeId)` を**リポジトリのインターフェース**に委譲する。impl は import しない。
- **infra** … リポジトリの**実装**が `getRecipeById` で Supabase から SELECT する。action がこの実装を usecase に注入している。

一覧取得（`findRecipesByAuthorId` など）も同じパターンで、usecase がリポジトリの find 系を 1 回呼んで返す。

---

### 4.2 作成（Create）— レシピ作成

**流れ**: 親エンティティ（レシピ）を作成したあと、子（材料・手順）を保存するなど、**複数リポジトリを順に呼ぶ**。

```mermaid
sequenceDiagram
    participant Form as presentation
    participant Action as app/recipe/new/action
    participant UseCase as usecase/create-recipe-usecase
    participant RecipeRepo as レシピリポジトリ（契約）<br/>実体は impl
    participant IngredientRepo as 材料リポジトリ（契約）<br/>実体は impl
    participant InstructionRepo as 手順リポジトリ（契約）<br/>実体は impl
    participant DB as lib/supabase

    Form->>Action: createRecipeAction(formData)
    Note over Action: deps で各 repo の impl を組み立て
    Action->>UseCase: createRecipe(input)
    UseCase->>RecipeRepo: createRecipe(input)
    Note over UseCase,RecipeRepo: usecase は契約にのみ依存
    RecipeRepo->>DB: recipes INSERT
    DB-->>RecipeRepo: recipe
    RecipeRepo-->>UseCase: Recipe

    UseCase->>IngredientRepo: saveIngredients(recipe.id, input.ingredients)
    IngredientRepo->>DB: ingredients INSERT
    DB-->>IngredientRepo: ok
    IngredientRepo-->>UseCase: void

    UseCase->>InstructionRepo: saveInstructions(recipe.id, input.instructions)
    InstructionRepo->>DB: instructions INSERT
    DB-->>InstructionRepo: ok
    InstructionRepo-->>UseCase: void

    UseCase-->>Action: Recipe
    Action-->>Form: Recipe or redirect
```

- **action** … usecase に「createRecipe 用の deps」（各リポジトリの**実装**）を渡してから `createRecipe(input)` を呼ぶ。usecase は契約だけに依存する。
- **usecase** … 1) createRecipe、2) saveIngredients、3) saveInstructions の順で**リポジトリのインターフェース**を呼ぶ。impl は import しない。
- **infra** … 各リポジトリの実装が INSERT を実行。これらは action が usecase に注入している。

---

### 4.3 更新（Update）— レシピ更新

**流れ**: リポジトリの `updateRecipe` を 1 回呼ぶ。子（材料・手順）を「全削除してから再挿入」する場合は、usecase 内で `saveIngredients` / `saveInstructions` を追加で呼ぶパターンになる。

```mermaid
sequenceDiagram
    participant Form as presentation
    participant Action as app/recipe/[id]/edit/action
    participant UseCase as usecase/update-recipe-usecase
    participant Repo as リポジトリ（契約）<br/>実体は action が注入した impl
    participant DB as lib/supabase

    Form->>Action: updateRecipeAction(recipeId, formData)
    Note over Action: usecase に repo を注入
    Action->>UseCase: updateRecipe(recipeId, input)
    UseCase->>UseCase: バリデーション等
    UseCase->>Repo: updateRecipe(recipeId, input)
    Note over UseCase,Repo: usecase は契約にのみ依存
    Repo->>DB: recipes UPDATE
    DB-->>Repo: recipe
    Repo-->>UseCase: Recipe
    UseCase-->>Action: Recipe
    Action-->>Form: Recipe or error
```

- **action** … usecase にリポジトリの**実装**を注入してから `updateRecipe` を呼ぶ。
- **usecase** … 必要ならバリデーションをしたあと、**リポジトリのインターフェース**の `updateRecipe` に委譲。impl には依存しない。
- **infra** … `updateRecipe` の実装で UPDATE を実行。

---

### 4.4 削除（Delete）— レシピ削除

**流れ**: リポジトリの `deleteRecipe`（または `deleteRecipeById`）を 1 回呼ぶ。関連データを先に消す必要がある場合は、usecase 内で子用の delete を先に呼ぶ。

```mermaid
sequenceDiagram
    participant Form as presentation
    participant Action as app/recipe/[id]/action
    participant UseCase as usecase/delete-recipe-usecase
    participant Repo as リポジトリ（契約）<br/>実体は action が注入した impl
    participant DB as lib/supabase

    Form->>Action: deleteRecipeAction(recipeId)
    Note over Action: usecase に repo を注入
    Action->>UseCase: deleteRecipe(recipeId)
    UseCase->>UseCase: 権限チェック等
    UseCase->>Repo: deleteRecipe(recipeId)
    Note over UseCase,Repo: usecase は契約にのみ依存
    Repo->>DB: recipes DELETE (または CASCADE)
    DB-->>Repo: ok
    Repo-->>UseCase: void
    UseCase-->>Action: void
    Action-->>Form: redirect or error
```

- **action** … usecase にリポジトリの**実装**を注入してから `deleteRecipe` を呼ぶ。
- **usecase** … 権限や削除可能条件を確認したあと、**リポジトリのインターフェース**の `deleteRecipe` に委譲。impl には依存しない。
- **infra** … `deleteRecipe` の実装で DELETE を実行（関連テーブルは CASCADE または usecase で明示的に delete を呼ぶ）。

---

### 4.5 CRUD 別の整理

| 操作 | 呼び出しの特徴 | リポジトリの例 |
|------|----------------|----------------|
| **参照（R）** | usecase が get/find を 1 回呼んで返す | `getRecipeById`, `findRecipesByAuthorId` |
| **作成（C）** | usecase が create のあと save 系を順に呼ぶことがある | `createRecipe` → `saveIngredients` → `saveInstructions` |
| **更新（U）** | usecase が update を 1 回（必要なら save を追加） | `updateRecipe`, 必要に応じて `saveIngredients` 等 |
| **削除（D）** | usecase が delete を 1 回（関連があれば先に子を delete） | `deleteRecipe`, `deleteIngredientsByRecipeId` 等 |

---

## 5. まとめ

- **依存の向き** … 内側（domain）は外側に依存しない。usecase は domain と「契約」にだけ依存し、**infrastructure は import しない**（実装は app 層で組み立てて渡す）。  
- **何をどこで呼ぶか** … 上記の図と表を基準にすると、「この処理はどの層に書くか」「この層からあの層を import してよいか」の判断がしやすい。  
- **認証** … すでに DI と「usecase → インターフェースのみ」ができている。  
- **レシピ作成** … 現状は usecase が infra を直接 import しているため、クリーンアーキテクチャに揃えるなら、app 層で infra を渡す形への変更を検討するとよい。

各ディレクトリの詳細なルールは、次の README を参照すること。

- `src/domain/models/_README.md`
- `src/domain/repositories/_README.md`
- `src/usecase/_README.md`
- `src/infrastructure/repositories/_README.md`
