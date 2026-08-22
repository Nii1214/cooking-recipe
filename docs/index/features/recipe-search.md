# レシピ検索

<!-- ID: recipe-search / ルート: /recipe/search -->

## 検索実行

キーワード・カテゴリによる絞り込みと結果取得。

| パス | 種類 | 関与 | 主要 symbol | 概要 |
|------|------|------|---------------|------|
| `src/domain/models/recipe/recipe-search-query.ts` | model | 専用 | `RecipeSearchQuery` | 検索条件（`keyword`, `categorySlug?`） |
| `src/usecase/recipe/search-recipe-summaries-usecase.ts` | usecase | 専用 | `searchRecipeSummaries` | 検索結果（お気に入り付きサマリー）の取得 |
| `src/infrastructure/repositories/recipe/recipe-read-repository-impl.ts` | repository | 共用 | `resolveSearchRecipeSummaryIds` | キーワード RPC とカテゴリ条件から対象 ID を解決（`recipe-top` 等でも使用） |
| 同上 | repository | 共用 | `getRecipeSummariesWithFavoriteBySearchQuery` | 検索画面で使用。ビュー `recipe_summaries_with_favorite` から取得 |
| 同上 | repository | 共用 | `getRecipeSummariesBySearchQuery` | お気に入りなし版（現状 app から未使用） |
| `src/app/recipe/search/page.tsx` | page | 専用 | `parseSearchParams`, `fetchSearchResultsWithUrls` | クエリ解析、deps 組み立て、検索実行 |

## カテゴリ選択肢

検索フォーム用のカテゴリ一覧。

| パス | 種類 | 関与 | 主要 symbol | 概要 |
|------|------|------|---------------|------|
| `src/infrastructure/repositories/recipe/recipe-read-repository-impl.ts` | repository | 共用 | `getCategoriesForSearchFilter` | `categories` から slug / 表示名を取得 |
| `src/app/recipe/search/page.tsx` | page | 専用 | | カテゴリ一覧と検索結果を並列取得 |

## 検索画面

フォーム・空状態など、検索専用 UI。

| パス | 種類 | 関与 | 主要 symbol | 概要 |
|------|------|------|---------------|------|
| `src/presentation/components/recipe/RecipeSearchPage.tsx` | component | 専用 | `RecipeSearchPage` | GET フォーム、結果セクション、空状態 |

## 結果一覧表示

検索結果のカード一覧（TOP 一覧と共用）。

| パス | 種類 | 関与 | 主要 symbol | 概要 |
|------|------|------|---------------|------|
| `src/domain/models/recipe/recipe-summary.ts` | model | 共用 | `RecipeSummary` | 結果のベース型（`recipe-top` でも使用） |
| `src/types/recipe.ts` | types | 共用 | `RecipeSummaryWithFavorite` | お気に入り・サムネ URL 付き表示型（`recipe-top` でも使用） |
| `src/lib/get-signed-image-url.ts` | lib | 共用 | `getSignedImageUrl` | サムネイル署名 URL 生成（`recipe-top`, `recipe-detail` でも使用） |
| `src/app/recipe/search/page.tsx` | page | 専用 | | 各結果に `thumbnailUrl` を付与 |
| `src/presentation/components/recipe/RecipeListPage.tsx` | component | 共用 | `RecipeListPage` | カード一覧（`recipe-top` でも使用） |
| `src/presentation/components/recipe/RecipeCard.tsx` | component | 共用 | `RecipeCard` | レシピ 1 件のカード（`recipe-top` でも使用） |

## リンク

他画面から検索へ遷移するリンク。

| パス | 種類 | 関与 | 主要 symbol | 概要 |
|------|------|------|---------------|------|
| `src/presentation/components/recipe/TopHero.tsx` | component | 導線のみ | | TOP から `/recipe/search` へのリンク（`recipe-top` 側のファイル） |

## データベース

| パス | 種類 | 主要 symbol | 概要 |
|------|------|---------------|------|
| `supabase/migrations/20260406000001_recipe_keyword_search_strpos.sql` | migration（RPC） | `recipe_summaries_ids_matching_keyword` | キーワード部分一致 |
| `supabase/migrations/20260420000001_recipe_summaries_with_favorite_search.sql` | migration（RPC） | `recipe_summaries_with_favorite_for_filter` | 旧実装（後続マイグレーションで廃止） |
| `supabase/migrations/20260421000001_recipe_summaries_with_favorite_view.sql` | migration（view） | `recipe_summaries_with_favorite` | お気に入り付きサマリー |

## 関連ドキュメント

- [レシピ検索画面-設計書](../../design/レシピ検索画面-設計書.md)
- [レシピ検索-キーワードマッチング設計](../../design/レシピ検索-キーワードマッチング設計.md)
- [recipe_summaries ビュー](../../tables/view/recipe_summaries.md)
