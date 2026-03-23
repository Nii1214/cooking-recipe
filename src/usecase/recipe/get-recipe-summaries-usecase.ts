import type { RecipeSummary } from "@/domain/models/recipe/recipe-summary";
import type { RecipeSummaryWithFavorite } from "@/types/recipe";

/**
 * このユースケースが依存する処理。
 * app 層で infrastructure の実装を渡す。
 */
type GetRecipeSummariesDeps = {
  getRecipeSummaries: () => Promise<RecipeSummary[]>;
  getFavoriteRecipeIds: () => Promise<string[]>;
};

/**
 * レシピサマリー一覧を取得し、お気に入りフラグを付与して返す。
 */
export const getRecipeSummariesUsecase = async (
  deps: GetRecipeSummariesDeps
): Promise<RecipeSummaryWithFavorite[]> => {
  const [summaries, favoriteIds] = await Promise.all([
    deps.getRecipeSummaries(),
    deps.getFavoriteRecipeIds(),
  ]);

  const favoriteSet = new Set(favoriteIds);

  return summaries.map((summary) => ({
    ...summary,
    isFavorited: favoriteSet.has(summary.id),
  }));
};
