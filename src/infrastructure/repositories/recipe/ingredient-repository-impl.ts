import type { IngredientInput } from "@/domain/repositories/recipe/ingredient-repository";
import { createAuthedClient } from "@/lib/supabase/server";

export const saveIngredients = async (
    recipeId: string,
    ingredients: IngredientInput[]
): Promise<void> => {
    const { supabase } = await createAuthedClient();

    const insertData = ingredients.map((item) => ({
        recipe_id: recipeId,
        ingredient_id: item.ingredientId ?? null,
        name: item.name,
        quantity_display: item.quantityDisplay,
        quantity_value: item.quantityValue ?? null,
        unit: item.unit,
        note: item.note ?? null,
        order_position: item.order + 1,
    }));

    const { error } = await supabase
        .from("recipe_ingredients")
        .insert(insertData);

    if (error) throw error;
};