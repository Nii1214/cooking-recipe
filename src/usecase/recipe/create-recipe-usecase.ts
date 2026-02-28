import { Recipe } from "@/domain/models/recipe/recipe";
import { RecipeInput } from "@/domain/repositories/recipe/recipe-repository";
import { saveIngredients } from "@/infrastructure/repositories/recipe/ingredient-repository-impl";
import { saveInstructions } from "@/infrastructure/repositories/recipe/instruction-repository-impl";
import { createRecipe } from "@/infrastructure/repositories/recipe/recipe-repository-impl";

export const createRecipeUsecase = async( input: RecipeInput):Promise<Recipe> => {
    try{
        const recipe = await createRecipe(input);
        await Promise.all([
            saveIngredients(recipe.id , input.ingredients),
            saveInstructions(recipe.id , input.instructions),
        ]);
        return recipe;
    }catch (error) {
        throw error;
    }
}