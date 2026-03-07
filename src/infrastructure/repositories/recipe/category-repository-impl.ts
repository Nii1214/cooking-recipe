import type { CategoryInput } from "@/domain/repositories/recipe/category-repository";
import { createAuthedClient } from "@/lib/supabase/server";

export const saveCategories = async (
    recipeId: string,
    categories: CategoryInput[]
): Promise<void> => {
    const { supabase } = await createAuthedClient();

    const insertData = categories.map((item) => ({
        recipe_id: recipeId,
        category_id: item.id,
    }));

    const { error } = await supabase
        .from("recipe_categories")
        .insert(insertData);

    if (error) throw error;
};