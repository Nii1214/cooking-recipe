import type { Recipe } from "@/domain/models/recipe/recipe";
import type { CategoryInput } from "./category-repository";
import type { IngredientInput } from "./ingredient-repository";
import type { InstructionInput } from "./instruction-repository";

export type RecipeInput = {
    id: string;
    title: string;
    description: string;
    thumbnailPath?: string;
    servingCount: number;
    preparationTimeMinutes: number;
    /** true: 一時保存中、false: 公開済み */
    isDraft: boolean;
    ingredients: IngredientInput[];
    instructions: InstructionInput[];
    categories: CategoryInput[];
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
};

/** レシピ作成時の入力。id / authorId / createdAt / updatedAt はサーバーで付与する */
export type CreateRecipeInput = Omit<
    RecipeInput,
    "id" | "authorId" | "createdAt" | "updatedAt"
>;

/** レシピ作成の結果 */
export type CreateRecipeResult =
    | { success: true; recipe: Recipe }
    | { success: false; error: string };