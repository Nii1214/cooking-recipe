"use server";

import {
  getFavoriteRecipeIds,
  addFavorite,
  removeFavorite,
} from "@/infrastructure/repositories/recipe/favorite-repository-impl";
import { toggleFavoriteUsecase } from "@/usecase/recipe/toggle-favorite-usecase";

export type ToggleFavoriteActionResult =
  | { success: true; isFavorited: boolean }
  | { success: false; error: string };

export async function toggleFavoriteAction(
  recipeId: string
): Promise<ToggleFavoriteActionResult> {
  try {
    const deps = {
      getFavoriteRecipeIds,
      addFavorite,
      removeFavorite,
    };

    const result = await toggleFavoriteUsecase(recipeId, deps);
    return { success: true, isFavorited: result.isFavorited };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "お気に入りの更新に失敗しました";
    return { success: false, error: message };
  }
}
