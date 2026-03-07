import type { Recipe } from "@/domain/models/recipe/recipe";
import type { RecipeInput } from "@/domain/repositories/recipe/recipe-repository";
import { createAuthedClient } from "@/lib/supabase/server";

export const createRecipe = async (input: RecipeInput): Promise<Recipe> => {
    const { supabase } = await createAuthedClient();

    const { data, error } = await supabase
        .from("recipes")
        .insert({
            id: input.id,
            title: input.title,
            description: input.description,
            thumbnail_url: input.thumbnailUrl ?? null,
            serving_count: input.servingCount,
            preparation_time_minutes: input.preparationTimeMinutes,
            is_draft: input.isDraft,
            author_id: input.authorId,
        })
        .select()
        .single();

    if (error) throw error;
    if (!data) throw new Error("INSERT_FAILED");

    return {
        id: data.id,
        title: data.title,
        description: data.description,
        thumbnailUrl: data.thumbnail_url ?? undefined,
        servingCount: data.serving_count,
        preparationTimeMinutes: data.preparation_time_minutes,
        isDraft: data.is_draft,
        authorId: data.author_id,
        ingredients: [],
        instructions: [],
        categories: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
    };
};