import type { Recipe } from "@/domain/models/recipe/recipe";

type GetRecipeDetailDeps = {
  getRecipeById: (id: string) => Promise<Recipe>;
};

export const getRecipeDetailUsecase = async (
  id: string,
  deps: GetRecipeDetailDeps
): Promise<Recipe> => {
  return deps.getRecipeById(id);
};
