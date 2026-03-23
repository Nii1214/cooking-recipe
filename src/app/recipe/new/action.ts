"use server";

import type { CreateRecipeResult, RecipeInput } from "@/domain/repositories/recipe/recipe-repository";
import { createRecipe } from "@/infrastructure/repositories/recipe/recipe-repository-impl";
import { saveIngredients } from "@/infrastructure/repositories/recipe/ingredient-repository-impl";
import { saveInstructions } from "@/infrastructure/repositories/recipe/instruction-repository-impl";
import { saveCategories } from "@/infrastructure/repositories/recipe/category-repository-impl";
import { createRecipeUsecase } from "@/usecase/recipe/create-recipe-usecase";
import { createAuthedClient } from "@/lib/supabase/server";

/** フォームから送信されるデータの型（UI 都合の型） */
export type CreateRecipeFormData = {
  title: string;
  description: string;
  servingCount: number;
  preparationTimeMinutes: number;
  isDraft: boolean;
  /** S3 にアップロード済みの画像パス（例: recipes/user-id/uuid.jpg）。未選択の場合は undefined */
  thumbnailPath?: string;
  categoryIds: string[];
  ingredients: Array<{
    name: string;
    /** 表示用文字列。"適量" なども入る */
    quantity: string;
    unit: string;
    note?: string;
    order: number;
  }>;
  instructions: Array<{
    stepNumber: number;
    description: string;
  }>;
};

/**
 * レシピ登録 Server Action
 * id / authorId / createdAt / updatedAt はサーバーで付与する。
 */
export async function createRecipeAction(
  formData: CreateRecipeFormData
): Promise<CreateRecipeResult> {
  try {
    const { user } = await createAuthedClient();
    const now = new Date();

    const recipeInput: RecipeInput = {
      id: crypto.randomUUID(),
      authorId: user.id,
      createdAt: now,
      updatedAt: now,
      title: formData.title,
      description: formData.description,
      thumbnailPath: formData.thumbnailPath,
      servingCount: formData.servingCount,
      preparationTimeMinutes: formData.preparationTimeMinutes || 1,
      isDraft: formData.isDraft,
      categories: formData.categoryIds.map((id) => ({ id, name: "", slug: "" })),
      ingredients: formData.ingredients.map((ing, idx) => ({
        name: ing.name,
        quantityDisplay: ing.quantity,
        quantityValue: isNaN(Number(ing.quantity)) ? undefined : Number(ing.quantity) || undefined,
        unit: ing.unit,
        note: ing.note,
        order: ing.order ?? idx,
      })),
      instructions: formData.instructions.map((inst) => ({
        stepNumber: inst.stepNumber,
        description: inst.description,
      })),
    };

    const deps = {
      createRecipe,
      saveIngredients,
      saveInstructions,
      saveCategories,
    };

    const recipe = await createRecipeUsecase(recipeInput, deps);
    return { success: true, recipe };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "レシピの登録に失敗しました";
    return { success: false, error: message };
  }
}
