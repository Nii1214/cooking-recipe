import { vi } from "vitest";
import type { Recipe } from "@/domain/models/recipe/recipe";
import type { CreateRecipeDeps } from "./create-recipe-usecase";

/**
 * テスト用の CreateRecipeDeps を生成する。
 * overrides で必要なだけ差し替え可能。
 */
export function createRecipeDepsForTest(
  overrides: Partial<CreateRecipeDeps> = {}
): CreateRecipeDeps {
  const mockRecipe: Recipe = {
    id: "recipe-1",
    title: "test",
    description: "",
    servingCount: 1,
    preparationTimeMinutes: 0,
    isDraft: false,
    ingredients: [],
    instructions: [],
    categories: [],
    authorId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    createRecipe: vi.fn().mockResolvedValue(mockRecipe),
    saveIngredients: vi.fn().mockResolvedValue(undefined),
    saveInstructions: vi.fn().mockResolvedValue(undefined),
    saveCategories: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}
