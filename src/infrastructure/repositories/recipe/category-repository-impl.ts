import { CategoryInput } from "@/domain/repositories/recipe/category-repository";
import { InstructionInput } from "@/domain/repositories/recipe/instrucsion-repository";
import { createAuthedClient } from "@/lib/supabase/server";

export const saveCategories = async(
    recipeId:string,
    category: CategoryInput[]
):Promise<void> => {

    const { supabase , user } = await createAuthedClient();

    // 保存用のデータに整形
    const insertData = category.map((item) => {
        // 一時的なID以外を抜き出し、残りの項目を抽出
        const { id, ...rest } = item; 
        
        return {
            recipe_id: recipeId, // 親IDをセット
            ...rest,             
        };
    });

    const { error } = await supabase
        .from("recipe-category-relations")
        .insert(insertData);

    if (error) throw error;
}