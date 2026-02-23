import { Category } from "./category";
import { Ingredient } from "./ingredient";
import { Instruction } from "./instruction";

export interface Recipe {
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string; // サムネイル画像
    servingCount: number; // 何人前か
    preparationTimeMinutes: number; // 調理時間
    ingredients: Ingredient[]; // 材料リスト
    instructions: Instruction[]; // 作り方の手順
    categories: Category[]; // 料理カテゴリ・タグ
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
}