import { InstructionInput } from "@/domain/repositories/recipe/instrucsion-repository";
import { createAuthedClient } from "@/lib/supabase/server";

export const saveInstructions = async (
    recipeId: string,
    instructions: InstructionInput[]
): Promise<void> => {
    const { supabase, user } = await createAuthedClient();

    const insertData = instructions.map((instruction) => ({
        recipe_id: recipeId,
        user_id: user.id,
        ...instruction,
    }));

    const { error } = await supabase
        .from('instructions')
        .insert(insertData);

    if (error) throw error;
}