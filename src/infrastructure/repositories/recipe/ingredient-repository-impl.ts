import { Ingredient } from "@/domain/models/recipe/ingredient";
import { createAuthedClient } from "@/lib/supabase/server";

export const saveIngredients =  async(
    recipeId: string, 
    ingredients: Ingredient[]
):Promise<void> => {
    const { supabase , user } = await createAuthedClient();

    // 保存用のデータに整形
    const insertData = ingredients.map((item) => {
        // 一時的なID以外を抜き出し、残りの項目を抽出
        const { id, ...rest } = item; 
        
        return {
            recipe_id: recipeId, // 親IDをセット
            ...rest,             
        };
    });

    const { error } = await supabase
        .from("ingredients")
        .insert(insertData);

    if (error) throw error;
}