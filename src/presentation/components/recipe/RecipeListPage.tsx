"use client";

import { useState } from "react";
import Link from "next/link";
import type { RecipeSummaryWithFavorite } from "@/types/recipe";
import { RecipeCard } from "./RecipeCard";
import { Plus, Heart, LayoutGrid } from "lucide-react";

type Props = {
  recipes: RecipeSummaryWithFavorite[];
};

export function RecipeListPage({ recipes: initialRecipes }: Props) {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const displayedRecipes = showFavoritesOnly
    ? recipes.filter((r) => r.isFavorited)
    : recipes;

  const favoriteCount = recipes.filter((r) => r.isFavorited).length;

  const handleFavoriteToggled = (recipeId: string, isFavorited: boolean) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, isFavorited } : r))
    );
  };

  return (
    <div className="space-y-6">
      {/* フィルタバー */}
      <div className="flex items-center justify-between bg-white rounded-xl p-2 shadow-sm border border-gray-100">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowFavoritesOnly(false)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !showFavoritesOnly
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            すべて
            <span
              className={`ml-1 text-xs ${!showFavoritesOnly ? "text-emerald-200" : "text-gray-400"}`}
            >
              {recipes.length}
            </span>
          </button>
          <button
            onClick={() => setShowFavoritesOnly(true)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showFavoritesOnly
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            お気に入り
            <span
              className={`ml-1 text-xs ${showFavoritesOnly ? "text-emerald-200" : "text-gray-400"}`}
            >
              {favoriteCount}
            </span>
          </button>
        </div>
        <span className="text-xs text-gray-400 pr-2">
          {displayedRecipes.length}件表示中
        </span>
      </div>

      {/* レシピ一覧 */}
      {displayedRecipes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-center py-20 space-y-5">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
              <span className="text-4xl">
                {showFavoritesOnly ? "💚" : "🍳"}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700 text-lg font-medium">
                {showFavoritesOnly
                  ? "お気に入りのレシピがありません"
                  : "レシピがまだ登録されていません"}
              </p>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                {showFavoritesOnly
                  ? "レシピのハートマークをタップすると、お気に入りに追加できます"
                  : "家族の味を、最初の一品から残しませんか？"}
              </p>
            </div>
            {!showFavoritesOnly && (
              <Link
                href="/recipe/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                最初のレシピを登録する
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onFavoriteToggled={handleFavoriteToggled}
            />
          ))}
        </div>
      )}
    </div>
  );
}
