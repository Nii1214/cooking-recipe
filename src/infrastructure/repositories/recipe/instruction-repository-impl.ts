import type { InstructionInput } from "@/domain/repositories/recipe/instruction-repository";
import { createAuthedClient } from "@/lib/supabase/server";

export const saveInstructions = async (
    recipeId: string,
    instructions: InstructionInput[]
): Promise<void> => {
    const { supabase } = await createAuthedClient();

    const insertData = instructions.map((instruction) => ({
        recipe_id: recipeId,
        step_number: instruction.stepNumber,
        description: instruction.description,
        image_url: instruction.imageUrl ?? null,
    }));

    const { error } = await supabase
        .from("recipe_instructions")
        .insert(insertData);

    if (error) throw error;
};