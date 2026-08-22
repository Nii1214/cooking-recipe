// npm run test:run -- src/app/recipe/new/action.test.ts
// npm run test:coverage -- --coverage.include='src/app/recipe/new/action.ts' src/app/recipe/new/action.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRecipeAction } from "./action";
import { createAuthedClient } from "@/lib/supabase/server";
import { createRecipeUsecase } from "@/usecase/recipe/create-recipe-usecase";

vi.mock("@/lib/supabase/server", () => ({
  createAuthedClient: vi.fn(),
}));

vi.mock("@/usecase/recipe/create-recipe-usecase", () => ({
  createRecipeUsecase: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/recipe/recipe-repository-impl", () => ({
  createRecipe: vi.fn(),
}));
vi.mock(
  "@/infrastructure/repositories/recipe/ingredient-repository-impl",
  () => ({ saveIngredients: vi.fn() }),
);
vi.mock(
  "@/infrastructure/repositories/recipe/instruction-repository-impl",
  () => ({ saveInstructions: vi.fn() }),
);
vi.mock("@/infrastructure/repositories/recipe/category-repository-impl", () => ({
  saveCategories: vi.fn(),
}));

describe("createRecipeAction", () => {
  const formData = {
    title: "カレー",
    description: "美味しい",
    servingCount: 2,
    preparationTimeMinutes: 0,
    isDraft: false,
    categoryIds: ["cat-1"],
    ingredients: [
      { name: "玉ねぎ", quantity: "適量", unit: "個", order: 0 },
      { name: "にんじん", quantity: "2", unit: "本", order: 1 },
    ],
    instructions: [{ stepNumber: 1, description: "切る" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAuthedClient).mockResolvedValue({
      user: { id: "user-1" },
    } as never);
  });

  it("成功時は recipe を返す", async () => {
    const mockRecipe = {
      id: "recipe-1",
      title: "カレー",
      description: "美味しい",
      servingCount: 2,
      preparationTimeMinutes: 1,
      isDraft: false,
      ingredients: [],
      instructions: [],
      categories: [],
      authorId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(createRecipeUsecase).mockResolvedValue(mockRecipe);

    const result = await createRecipeAction(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.recipe.title).toBe("カレー");
    }
    expect(createRecipeUsecase).toHaveBeenCalledOnce();
  });

  it("preparationTimeMinutes が 0 のとき 1 に補正する", async () => {
    vi.mocked(createRecipeUsecase).mockImplementation(async (input) => ({
      id: input.id,
      title: input.title,
      description: input.description,
      servingCount: input.servingCount,
      preparationTimeMinutes: input.preparationTimeMinutes,
      isDraft: input.isDraft,
      ingredients: [],
      instructions: [],
      categories: [],
      authorId: input.authorId,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    }));

    await createRecipeAction(formData);

    const input = vi.mocked(createRecipeUsecase).mock.calls[0][0];
    expect(input.preparationTimeMinutes).toBe(1);
    expect(input.ingredients[0].quantityValue).toBeUndefined();
    expect(input.ingredients[1].quantityValue).toBe(2);
  });

  it("quantity が 0 のとき quantityValue は undefined", async () => {
    vi.mocked(createRecipeUsecase).mockImplementation(async (input) => ({
      id: input.id,
      title: input.title,
      description: input.description,
      servingCount: input.servingCount,
      preparationTimeMinutes: input.preparationTimeMinutes,
      isDraft: input.isDraft,
      ingredients: input.ingredients.map((i) => ({
        id: "ing",
        name: i.name,
        quantityDisplay: i.quantityDisplay,
        quantityValue: i.quantityValue,
        unit: i.unit,
        order: i.order,
      })),
      instructions: [],
      categories: [],
      authorId: input.authorId,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    }));

    await createRecipeAction({
      ...formData,
      thumbnailPath: "user-1/img.webp",
      ingredients: [{ name: "塩", quantity: "0", unit: "g", order: undefined as never }],
    });

    const input = vi.mocked(createRecipeUsecase).mock.calls[0][0];
    expect(input.thumbnailPath).toBe("user-1/img.webp");
    expect(input.ingredients[0].quantityValue).toBeUndefined();
    expect(input.ingredients[0].order).toBe(0);
  });

  it("失敗時はエラーメッセージを返す", async () => {
    vi.mocked(createRecipeUsecase).mockRejectedValue(new Error("save failed"));

    const result = await createRecipeAction(formData);

    expect(result).toEqual({ success: false, error: "save failed" });
  });

  it("Error 以外の throw は汎用メッセージ", async () => {
    vi.mocked(createRecipeUsecase).mockRejectedValue("unexpected");

    const result = await createRecipeAction(formData);

    expect(result).toEqual({
      success: false,
      error: "レシピの登録に失敗しました",
    });
  });
});
