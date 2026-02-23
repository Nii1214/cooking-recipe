import { CategoryInput } from "./category-repository";
import { IngredientInput } from "./ingredient-repository";
import { InstructionInput } from "./instrucsion-repository";

export type RecipeInput = {
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string; // サムネイル画像
    servingCount: number; // 何人前か
    preparationTimeMinutes: number; // 調理時間
    ingredients: IngredientInput[]; // 材料リスト
    instructions: InstructionInput[]; // 作り方の手順
    categories: CategoryInput[]; // 料理カテゴリ・タグ
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
}