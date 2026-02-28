import type { Recipe } from "@/domain/models/recipe/recipe";
import type { RecipeInput } from "@/domain/repositories/recipe/recipe-repository";

/**
 * レシピ作成ユースケースが依存する処理。
 * action 層で infrastructure の実装を渡す。
 */
export type CreateRecipeDeps = {
  createRecipe: (input: RecipeInput) => Promise<Recipe>;
  saveIngredients: (
    recipeId: string,
    ingredients: RecipeInput["ingredients"]
  ) => Promise<void>;
  saveInstructions: (
    recipeId: string,
    instructions: RecipeInput["instructions"]
  ) => Promise<void>;
};

export const createRecipeUsecase = async (
  input: RecipeInput,
  deps: CreateRecipeDeps
): Promise<Recipe> => {
  const recipe = await deps.createRecipe(input);
  await Promise.all([
    deps.saveIngredients(recipe.id, input.ingredients),
    deps.saveInstructions(recipe.id, input.instructions),
  ]);
  return recipe;
};
