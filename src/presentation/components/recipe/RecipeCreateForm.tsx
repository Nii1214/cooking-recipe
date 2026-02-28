"use client";

import { useState } from "react";
import type { IngredientUI, InstructionUI } from "./recipe-create-types";
import { RecipeCategorySection } from "./RecipeCategorySection";
import { RecipeGeneralSection } from "./RecipeGeneralSection";
import { RecipeIngredientsSection } from "./RecipeIngredientsSection";
import { RecipeInstructionsSection } from "./RecipeInstructionsSection";

export function RecipeCreateForm() {
    const [title, setTitle] = useState("");
    const [minutes, setMinutes] = useState<number | "">("");
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

    return (
        <form
            className="rounded-xl bg-white p-6 shadow-sm border border-gray-100"
            onSubmit={(e) => {
                e.preventDefault();
                console.log("Submit(UIのみ):", {
                    title,
                    minutes,
                    comment,
                    selectedCategories,
                    ingredients,
                    instructions,
                    imageFile,
                });
            }}
        >
            <div className="space-y-8">
                <RecipeGeneralSection
                    title={title}
                    setTitle={setTitle}
                    minutes={minutes}
                    setMinutes={setMinutes}
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

                <section className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
                    >
                        下書き保存（未実装）
                    </button>
                    <button
                        type="submit"
                        className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 order-1 sm:order-2"
                    >
                        レシピを登録（未接続）
                    </button>
                </section>
            </div>
        </form>
    );
}
