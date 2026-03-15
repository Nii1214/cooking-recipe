import { RecipeListPage } from "@/presentation/components/recipe/RecipeListPage";
import { getRecipeSummaries } from "@/infrastructure/repositories/recipe/recipe-read-repository-impl";
import { getFavoriteRecipeIds } from "@/infrastructure/repositories/recipe/favorite-repository-impl";
import { getRecipeSummariesUsecase } from "@/usecase/recipe/get-recipe-summaries-usecase";
import {
  TopHero,
  QuickAccessSection,
} from "@/presentation/components/recipe/TopHero";

export default async function TopPage() {
  try {
    const deps = {
      getRecipeSummaries,
      getFavoriteRecipeIds,
    };

    const recipes = await getRecipeSummariesUsecase(deps);

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <TopHero recipeCount={recipes.length} />
        <QuickAccessSection />

        <div
          id="recipe-list"
          className="w-full max-w-5xl mx-auto px-4 pt-10 pb-16"
        >
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-gray-900 font-serif">
              みんなのレシピ
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            家族が登録した公開済みのレシピ一覧です
          </p>
          <RecipeListPage recipes={recipes} />
        </div>
      </div>
    );
  } catch {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl">😢</div>
          <p className="text-gray-600 text-lg">レシピの取得に失敗しました</p>
          <p className="text-sm text-gray-400">
            しばらくしてからもう一度お試しください
          </p>
        </div>
      </div>
    );
  }
}
