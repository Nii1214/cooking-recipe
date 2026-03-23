"use client";

import { useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/app/top/action";

type Props = {
  recipeId: string;
  isFavorited: boolean;
  onToggled: (recipeId: string, isFavorited: boolean) => void;
};

export function FavoriteButton({ recipeId, isFavorited, onToggled }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const result = await toggleFavoriteAction(recipeId);
      if (result.success) {
        onToggled(recipeId, result.isFavorited);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex-shrink-0 p-1 rounded-full transition-colors hover:bg-gray-100"
      aria-label={isFavorited ? "お気に入りから削除" : "お気に入りに追加"}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          isFavorited
            ? "fill-red-500 text-red-500"
            : "text-gray-300 hover:text-red-400"
        }`}
      />
    </button>
  );
}
