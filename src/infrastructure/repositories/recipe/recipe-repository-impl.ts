import { Recipe } from "@/domain/models/recipe/recipe";
import { RecipeInput } from "@/domain/repositories/recipe/recipe-repository";
import { createAuthedClient, createClient } from "@/lib/supabase/server";

export const createRecipe = async (input: RecipeInput):Promise<Recipe> => {
    const { supabase, user } = await createAuthedClient();

    const { data , error } = await supabase
        .from('recipes')
        .insert({
            ...input,
            user_id: user.id,
        })
        .select()
        .single();
    
    if(error) throw error;
    if (!data) throw new Error("INSERT_FAILED");
    
    return {
        ...data,
        thumbnailUrl: data.thumbnail_url,
        servingCount: data.serving_count,
        preparationTimeMinutes: data.preparation_time_minutes,
        authorId: data.user_id,
        ingredients: [], 
        instructions: [],
        categories: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
    }
};