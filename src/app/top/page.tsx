import { RecipeListPage } from "@/presentation/components/recipe/RecipeListPage";
import { getRecipeSummaries } from "@/infrastructure/repositories/recipe/recipe-read-repository-impl";
import { getFavoriteRecipeIds } from "@/infrastructure/repositories/recipe/favorite-repository-impl";
import { getRecipeSummariesUsecase } from "@/usecase/recipe/get-recipe-summaries-usecase";
import {
  TopHero,
  QuickAccessSection,
} from "@/presentation/components/recipe/TopHero";
import { getPresignedImageUrl } from "@/lib/get-presigned-image-url";

async function fetchRecipesWithUrls() {
  const deps = {
    getRecipeSummaries,
    getFavoriteRecipeIds,
  };

  const recipes = await getRecipeSummariesUsecase(deps);

  return Promise.all(
    recipes.map(async (recipe) => ({
      ...recipe,
      thumbnailUrl: recipe.thumbnailPath
        ? await getPresignedImageUrl(recipe.thumbnailPath)
        : undefined,
    }))
  );
}

export default async function TopPage() {
  let recipesWithUrls: Awaited<ReturnType<typeof fetchRecipesWithUrls>>;

  try {
    recipesWithUrls = await fetchRecipesWithUrls();
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <TopHero recipeCount={recipesWithUrls.length} />
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
        <RecipeListPage recipes={recipesWithUrls} />
      </div>
    </div>
  );
}
