"use server";

import type { CreateRecipeInput, CreateRecipeResult, RecipeInput } from "@/domain/repositories/recipe/recipe-repository";
import { createRecipe } from "@/infrastructure/repositories/recipe/recipe-repository-impl";
import { saveIngredients } from "@/infrastructure/repositories/recipe/ingredient-repository-impl";
import { saveInstructions } from "@/infrastructure/repositories/recipe/instruction-repository-impl";
import { createRecipeUsecase } from "@/usecase/recipe/create-recipe-usecase";
import { createAuthedClient } from "@/lib/supabase/server";

/**
 * レシピ登録
 * id / authorId / createdAt / updatedAt はサーバーで付与する。
 */
export async function createRecipeAction(
  input: CreateRecipeInput
): Promise<CreateRecipeResult> {
  try {
    const { user } = await createAuthedClient();
    const now = new Date();
    const recipeInput: RecipeInput = {
      ...input,
      id: crypto.randomUUID(),
      authorId: user.id,
      createdAt: now,
      updatedAt: now,
    };

    const deps = {
      createRecipe,
      saveIngredients,
      saveInstructions,
    };

    const recipe = await createRecipeUsecase(recipeInput, deps);
    return { success: true, recipe };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "レシピの登録に失敗しました";
    return { success: false, error: message };
  }
}
