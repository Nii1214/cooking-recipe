"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { IngredientUI, InstructionUI } from "./recipe-create-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RecipeCategorySection } from "./RecipeCategorySection";
import { RecipeGeneralSection } from "./RecipeGeneralSection";
import { RecipeIngredientsSection } from "./RecipeIngredientsSection";
import { RecipeInstructionsSection } from "./RecipeInstructionsSection";
import { createRecipeAction } from "@/app/recipe/new/action";

export function RecipeCreateForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [minutes, setMinutes] = useState<number | "">("");
    const [servingCount, setServingCount] = useState<number | "">("");
    const [comment, setComment] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const [ingredients, setIngredients] = useState<IngredientUI[]>([
        { id: crypto.randomUUID(), name: "", quantity: "", unit: "", order: 0 },
    ]);

    const [instructions, setInstructions] = useState<InstructionUI[]>([
        { id: crypto.randomUUID(), stepNumber: 1, description: "", images: [] },
    ]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleImageClear = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const addIngredient = () => {
        setIngredients((prev) => [
            ...prev,
            { id: crypto.randomUUID(), name: "", quantity: "", unit: "", order: prev.length },
        ]);
    };

    const removeIngredient = (id: string) => {
        setIngredients((prev) => {
            const filtered = prev.filter((ing) => ing.id !== id);
            return filtered.map((ing, idx) => ({ ...ing, order: idx }));
        });
    };

    const addInstruction = () => {
        setInstructions((prev) => [
            ...prev,
            { id: crypto.randomUUID(), stepNumber: prev.length + 1, description: "", images: [] },
        ]);
    };

    const addInstructionImage = (instructionId: string, file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setInstructions((prev) =>
                prev.map((v) =>
                    v.id === instructionId ? { ...v, images: [...v.images, { preview: reader.result as string, file }] } : v
                )
            );
        };
        reader.readAsDataURL(file);
    };

    const removeInstructionImage = (instructionId: string, imageIndex: number) => {
        setInstructions((prev) =>
            prev.map((v) =>
                v.id === instructionId ? { ...v, images: v.images.filter((_, i) => i !== imageIndex) } : v
            )
        );
    };

    const removeInstruction = (id: string) => {
        setInstructions((prev) => {
            const filtered = prev.filter((inst) => inst.id !== id);
            return filtered.map((inst, idx) => ({ ...inst, stepNumber: idx + 1 }));
        });
    };

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
        );
    };

    const buildFormData = (isDraft: boolean) => ({
        title,
        description: comment,
        servingCount: Number(servingCount) || 1,
        preparationTimeMinutes: Number(minutes) || 0,
        isDraft,
        categoryIds: selectedCategories,
        ingredients: ingredients.map((ing, idx) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            note: ing.note,
            order: idx,
        })),
        instructions: instructions.map((inst) => ({
            stepNumber: inst.stepNumber,
            description: inst.description,
        })),
    });

    const handleSubmit = (isDraft: boolean) => {
        setError(null);
        startTransition(async () => {
            const result = await createRecipeAction(buildFormData(isDraft));
            if (result.success) {
                router.push(`/recipe/${result.recipe.id}`);
            } else {
                setError(result.error);
            }
        });
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(false);
            }}
        >
            <Card className="p-6">
                <CardContent className="pt-0 space-y-8">
                <RecipeGeneralSection
                    title={title}
                    setTitle={setTitle}
                    minutes={minutes}
                    setMinutes={setMinutes}
                    servingCount={servingCount}
                    setServingCount={setServingCount}
                    comment={comment}
                    setComment={setComment}
                    imagePreview={imagePreview}
                    onImageChange={handleImageChange}
                    onImageClear={handleImageClear}
                />

                <RecipeCategorySection
                    selectedCategories={selectedCategories}
                    onToggleCategory={toggleCategory}
                />

                <RecipeIngredientsSection
                    ingredients={ingredients}
                    onIngredientsChange={setIngredients}
                    onAddIngredient={addIngredient}
                    onRemoveIngredient={removeIngredient}
                />

                <RecipeInstructionsSection
                    instructions={instructions}
                    onInstructionsChange={setInstructions}
                    onAddInstruction={addInstruction}
                    onAddInstructionImage={addInstructionImage}
                    onRemoveInstructionImage={removeInstructionImage}
                    onRemoveInstruction={removeInstruction}
                />

                {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                )}

                <section className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border">
                    <Button
                        type="button"
                        variant="outline"
                        className="order-2 sm:order-1"
                        disabled={isPending}
                        onClick={() => handleSubmit(true)}
                    >
                        {isPending ? "保存中..." : "下書き保存"}
                    </Button>
                    <Button
                        type="submit"
                        className="order-1 sm:order-2 bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500"
                        disabled={isPending}
                    >
                        {isPending ? "登録中..." : "レシピを登録"}
                    </Button>
                </section>
                </CardContent>
            </Card>
        </form>
    );
}
