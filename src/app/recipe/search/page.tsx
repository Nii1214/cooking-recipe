import type { Metadata } from "next";
import { RecipeSearchPage } from "@/presentation/components/recipe/RecipeSearchPage";
import { APP_NAME } from "@/constants/app";
import {
  getRecipeSummariesWithFavoriteBySearchQuery,
  getCategoriesForSearchFilter,
} from "@/infrastructure/repositories/recipe/recipe-read-repository-impl";
import { searchRecipeSummaries } from "@/usecase/recipe/search-recipe-summaries-usecase";
import { getSignedImageUrl } from "@/lib/get-signed-image-url";
import type { RecipeSearchQuery } from "@/domain/models/recipe/recipe-search-query";

export const metadata: Metadata = {
  title: `レシピを探す | ${APP_NAME}`,
  description: "キーワードやカテゴリで家族のレシピを検索できます。",
};

type Props = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

function parseSearchParams(searchParams: {
  q?: string;
  category?: string;
}): RecipeSearchQuery {
  const keyword = typeof searchParams.q === "string" ? searchParams.q : "";
  const raw =
    typeof searchParams.category === "string"
      ? searchParams.category.trim()
      : "";
  const categorySlug = raw.length > 0 ? raw : undefined;
  return { keyword, categorySlug };
}

export default async function RecipeSearchRoutePage({ searchParams }: Props) {
  const sp = await searchParams;
  const query = parseSearchParams(sp);

  let categoryOptions: Awaited<
    ReturnType<typeof getCategoriesForSearchFilter>
  >;
  let recipesWithUrls: Awaited<
    ReturnType<typeof fetchSearchResultsWithUrls>
  >;

  try {
    [categoryOptions, recipesWithUrls] = await Promise.all([
      getCategoriesForSearchFilter(),
      fetchSearchResultsWithUrls(query),
    ]);
  } catch {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-gray-700 text-lg">検索に失敗しました</p>
          <p className="text-sm text-gray-500">
            しばらくしてからもう一度お試しください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <RecipeSearchPage
          recipes={recipesWithUrls}
          initialKeyword={query.keyword}
          initialCategorySlug={query.categorySlug}
          categoryOptions={categoryOptions}
        />
      </div>
    </div>
  );
}

async function fetchSearchResultsWithUrls(query: RecipeSearchQuery) {
  const deps = {
    getRecipeSummariesWithFavoriteBySearchQuery,
  };

  const recipes = await searchRecipeSummaries(query, deps);

  return Promise.all(
    recipes.map(async (recipe) => ({
      ...recipe,
      thumbnailUrl: recipe.thumbnailPath
        ? await getSignedImageUrl(recipe.thumbnailPath)
        : undefined,
    })),
  );
}
