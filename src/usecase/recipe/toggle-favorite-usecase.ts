type ToggleFavoriteDeps = {
  getFavoriteRecipeIds: () => Promise<string[]>;
  addFavorite: (recipeId: string) => Promise<void>;
  removeFavorite: (recipeId: string) => Promise<void>;
};

export type ToggleFavoriteResult = {
  isFavorited: boolean;
};

export const toggleFavoriteUsecase = async (
  recipeId: string,
  deps: ToggleFavoriteDeps
): Promise<ToggleFavoriteResult> => {
  const favoriteIds = await deps.getFavoriteRecipeIds();
  const currentlyFavorited = favoriteIds.includes(recipeId);

  if (currentlyFavorited) {
    await deps.removeFavorite(recipeId);
    return { isFavorited: false };
  } else {
    await deps.addFavorite(recipeId);
    return { isFavorited: true };
  }
};
