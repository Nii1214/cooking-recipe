"use client";

import Link from "next/link";
import type { RecipeSummaryWithFavorite } from "@/types/recipe";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "./FavoriteButton";
import { Clock, Users } from "lucide-react";

type Props = {
  recipe: RecipeSummaryWithFavorite;
  onFavoriteToggled: (recipeId: string, isFavorited: boolean) => void;
};

const placeholderEmojis = ["🍛", "🍲", "🥘", "🍜", "🍳", "🥗", "🍙", "🍤"];

function getPlaceholderEmoji(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
  }
  return placeholderEmojis[Math.abs(hash) % placeholderEmojis.length];
}

export function RecipeCard({ recipe, onFavoriteToggled }: Props) {
  return (
    <Link href={`/recipe/${recipe.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* サムネイル */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {recipe.thumbnailUrl ? (
            <img
              src={recipe.thumbnailUrl}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-50 flex items-center justify-center">
              <span className="text-5xl opacity-60 group-hover:scale-110 transition-transform duration-300">
                {getPlaceholderEmoji(recipe.id)}
              </span>
            </div>
          )}
          {/* オーバーレイのお気に入りボタン */}
          <div className="absolute top-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-sm">
              <FavoriteButton
                recipeId={recipe.id}
                isFavorited={recipe.isFavorited}
                onToggled={onFavoriteToggled}
              />
            </div>
          </div>
          {/* 調理時間バッジ */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
              <Clock className="w-3 h-3" />
              {recipe.preparationTimeMinutes}分
            </span>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 p-4 space-y-2.5">
          <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
            {recipe.title}
          </h3>

          {recipe.description && (
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {recipe.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <Users className="w-3.5 h-3.5" />
              {recipe.servingCount}人前
            </span>

            {recipe.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-end">
                {recipe.categories.slice(0, 2).map((cat) => (
                  <Badge
                    key={cat.id}
                    variant="secondary"
                    className="text-[10px] px-2 py-0"
                  >
                    {cat.name}
                  </Badge>
                ))}
                {recipe.categories.length > 2 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-2 py-0"
                  >
                    +{recipe.categories.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
