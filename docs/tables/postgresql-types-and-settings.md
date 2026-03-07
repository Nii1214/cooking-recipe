# PostgreSQL / Supabase テーブル設計リファレンス

テーブル定義書を書く際に参照する、PostgreSQL の型・制約・初期値・Supabase 固有の設定をまとめたリファレンスです。

---

## 目次

1. [カラム型一覧](#カラム型一覧)
2. [制約（Constraint）](#制約constraint)
3. [デフォルト値（Default）](#デフォルト値default)
4. [主キー・外部キー](#主キー外部キー)
5. [インデックス](#インデックス)
6. [Supabase 固有の設定](#supabase-固有の設定)
7. [RLS（Row Level Security）](#rlsrow-level-security)
8. [テーブル定義書の書き方ルール](#テーブル定義書の書き方ルール)

---

## カラム型一覧

### 文字列

| 型 | 説明 | 使いどころ |
|---|---|---|
| `text` | 長さ制限なし文字列 | タイトル・説明文・URL など |
| `varchar(n)` | 最大 n 文字の文字列 | 長さの上限を明示したい場合 |
| `char(n)` | 固定長 n 文字（空白でパディング） | ほぼ使わない |

> **推奨**: Supabase / PostgreSQL では `text` と `varchar` に性能差はないため、基本は `text` を使う。

---

### 数値

| 型 | 説明 | 使いどころ |
|---|---|---|
| `integer` / `int4` | 整数（-2^31 〜 2^31-1） | 件数・人数・順番など |
| `bigint` / `int8` | 大きな整数（-2^63 〜 2^63-1） | 大量カウント・外部システム ID など |
| `smallint` / `int2` | 小さな整数（-32768 〜 32767） | フラグや小さな区分値 |
| `numeric(p, s)` | 任意精度の固定小数点数 | 金額・正確な小数が必要な場合 |
| `real` / `float4` | 単精度浮動小数点 | 座標・センサー値など（誤差あり） |
| `double precision` / `float8` | 倍精度浮動小数点 | より精度が必要な小数 |

---

### 日付・時刻

| 型 | 説明 | 使いどころ |
|---|---|---|
| `timestamptz` | タイムゾーン付きタイムスタンプ | **作成日時・更新日時に推奨**（UTC で保存される） |
| `timestamp` | タイムゾーンなしタイムスタンプ | 非推奨。特別な理由がない限り `timestamptz` を使う |
| `date` | 日付のみ（時刻なし） | 誕生日・祝日など |
| `time` | 時刻のみ（日付なし） | 開店時間など |
| `interval` | 時間の差分 | 経過時間・有効期限の計算など |

---

### 真偽値

| 型 | 説明 | 使いどころ |
|---|---|---|
| `boolean` | `true` / `false` / `NULL` | フラグ全般 |

---

### ID・UUID

| 型 | 説明 | 使いどころ |
|---|---|---|
| `uuid` | 128bit のユニーク ID | **主キーに推奨**（Supabase では標準） |
| `serial` / `bigserial` | 自動連番の整数 | 旧来の整数 ID（UUID を推奨） |

---

### JSON

| 型 | 説明 | 使いどころ |
|---|---|---|
| `jsonb` | バイナリ形式の JSON（インデックス可） | **構造化データを柔軟に持ちたい場合に推奨** |
| `json` | テキスト形式の JSON | ほぼ `jsonb` でよい |

---

### その他

| 型 | 説明 | 使いどころ |
|---|---|---|
| `text[]` | テキストの配列 | タグ・複数選択肢など（中間テーブルで代替も可） |
| `integer[]` | 整数の配列 | - |
| `bytea` | バイナリデータ | ファイルの生データ（通常はストレージを使う） |

---

## 制約（Constraint）

| 制約 | SQL 記法 | 説明 |
|---|---|---|
| NOT NULL | `column_name type not null` | NULL を禁止する |
| UNIQUE | `column_name type unique` | 重複を禁止する |
| PRIMARY KEY | `column_name type primary key` | 主キー（NOT NULL + UNIQUE） |
| FOREIGN KEY | `references other_table(id)` | 外部キー参照 |
| CHECK | `check (condition)` | 任意の条件を検証する |
| DEFAULT | `default value` | 値未指定時のデフォルト値 |

---

## デフォルト値（Default）

よく使うデフォルト値の書き方。

| 用途 | 記法 | 例 |
|---|---|---|
| UUID を自動生成 | `default gen_random_uuid()` | 主キーに使用 |
| 現在時刻を自動設定 | `default now()` | `created_at`, `updated_at` に使用 |
| 固定の文字列 | `default 'value'` | ステータスの初期値など |
| 固定の数値 | `default 0` | カウント初期値など |
| 真偽値 | `default true` / `default false` | フラグの初期値 |

---

## 主キー・外部キー

### 主キー

```sql
-- UUID を主キーにする（Supabase 推奨パターン）
id uuid primary key default gen_random_uuid()
```

### 外部キー

```sql
-- 基本形
recipe_id uuid not null references recipes(id)

-- 親レコード削除時に子レコードも削除（CASCADE）
recipe_id uuid not null references recipes(id) on delete cascade

-- 親レコード削除を禁止（RESTRICT）
recipe_id uuid not null references recipes(id) on delete restrict

-- 親レコード削除時に NULL にする
recipe_id uuid references recipes(id) on delete set null
```

> **本プロジェクトの方針**: レシピが削除された場合、材料・手順など紐づくデータも削除したいので `on delete cascade` を基本とする。

---

## インデックス

頻繁に検索・結合に使うカラムにはインデックスを貼る。

```sql
-- 単一カラム
create index on recipes(author_id);

-- 複合カラム
create index on recipe_ingredients(recipe_id, order_position);

-- 一意制約を持つインデックス
create unique index on categories(slug);
```

> **注意**: 主キーと UNIQUE 制約にはインデックスが自動的に作成されるため、重複して作成しない。

---

## Supabase 固有の設定

### `auth.users` との連携

Supabase では認証ユーザーが `auth.users` テーブルに自動で格納されます。
アプリのテーブルでユーザーを参照する際は `auth.users(id)` に外部キーを張ります。

```sql
author_id uuid not null references auth.users(id)
```

> 注意: `auth.users` は直接 SELECT できないため、`public` スキーマに `profiles` テーブルなどを作って同期するパターンが一般的です。

### updated_at の自動更新（トリガー）

PostgreSQL では `updated_at` を自動更新する仕組みが標準にないため、トリガーを作成します。

```sql
-- トリガー関数を定義（一度だけ作れば全テーブルで使い回せる）
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- テーブルにトリガーをアタッチ
create trigger set_updated_at
  before update on recipes
  for each row
  execute function update_updated_at();
```

### ストレージ（画像 URL）

画像の実体は Supabase Storage に保存し、テーブルには URL（`text`）のみを持ちます。
Storage のパスから URL を組み立てる方法は infrastructure 層で行います。

---

## RLS（Row Level Security）

Supabase では RLS を有効にして、テーブルごとにアクセス制御のポリシーを設定します。

### 有効化

```sql
alter table テーブル名 enable row level security;
```

### よく使うポリシーパターン

```sql
-- 認証済みユーザーは全レコードを読み取れる
create policy "authenticated users can read"
  on テーブル名 for select
  using (auth.role() = 'authenticated');

-- 自分が作成したレコードのみ読み取れる
create policy "users can read own records"
  on テーブル名 for select
  using (auth.uid() = author_id);

-- 自分が作成したレコードのみ更新・削除できる
create policy "users can update own records"
  on テーブル名 for update
  using (auth.uid() = author_id);

create policy "users can delete own records"
  on テーブル名 for delete
  using (auth.uid() = author_id);

-- 認証済みユーザーは誰でも INSERT できる（author_id は自動セット）
create policy "authenticated users can insert"
  on テーブル名 for insert
  with check (auth.uid() = author_id);
```

---

## テーブル定義書の書き方ルール

`docs/tables/{ドメイン}/` 配下に以下の形式で記述します。

### ファイル命名規則

```
docs/tables/
├── postgresql-types-and-settings.md   ← このファイル（リファレンス）
├── recipe/
│   ├── recipes.md
│   ├── categories.md
│   ├── recipe_categories.md           ← 中間テーブル
│   ├── ingredients.md
│   └── instructions.md
└── auth/
    └── profiles.md
```

### テーブル定義書のフォーマット

```markdown
# テーブル名: {table_name}

## 概要
このテーブルが表すもの・役割を 1〜2 行で説明する。

## ドメインモデルとの対応
対応する `src/domain/models/` のファイルを記載する。

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---|---|---|---|
| id | uuid | NOT NULL | gen_random_uuid() | 主キー |
| ... | ... | ... | ... | ... |

## 制約・インデックス
- 外部キー・UNIQUE・CHECK 制約を箇条書きで記載
- インデックスも記載

## RLS ポリシー
- どのロール・条件でアクセスを許可するか記載

## 備考
設計上の意思決定や注意点があれば記載する。
```
