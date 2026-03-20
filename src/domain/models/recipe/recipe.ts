import { Category } from "./category";
import { Ingredient } from "./ingredient";
import { Instruction } from "./instruction";

export interface Recipe {
    id: string;
    title: string;
    description: string;
    thumbnailPath?: string;
    servingCount: number;
    preparationTimeMinutes: number;
    isDraft: boolean;
    ingredients: Ingredient[];
    instructions: Instruction[];
    categories: Category[];
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
}