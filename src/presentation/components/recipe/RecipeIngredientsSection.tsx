"use client";

import { useState } from "react";
import { GripVertical, Plus, X } from "lucide-react";
import type { IngredientUI } from "./recipe-create-types";

type Props = {
    ingredients: IngredientUI[];
    onIngredientsChange: React.Dispatch<React.SetStateAction<IngredientUI[]>>;
    onAddIngredient: () => void;
    onRemoveIngredient: (id: string) => void;
};

export function RecipeIngredientsSection({
    ingredients,
    onIngredientsChange,
    onAddIngredient,
    onRemoveIngredient,
}: Props) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(index));
    };
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };
    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }
        onIngredientsChange((prev) => {
            const next = [...prev];
            const [draggedItem] = next.splice(draggedIndex, 1);
            next.splice(dropIndex, 0, draggedItem);
            return next.map((ing, idx) => ({ ...ing, order: idx }));
        });
        setDraggedIndex(null);
    };
    const handleDragEnd = () => setDraggedIndex(null);

    return (
        <section className="space-y-3">
            <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
                材料 <span className="text-red-500">*</span>
            </h2>
            <div className="space-y-2">
                {ingredients.map((ing, index) => (
                    <div
                        key={ing.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={[
                            "flex items-center gap-3 p-3 rounded-lg border transition-all bg-white",
                            draggedIndex === index ? "border-blue-500 bg-blue-50 opacity-80" : "border-gray-200 hover:border-gray-300",
                        ].join(" ")}
                    >
                        <div className="cursor-move text-gray-400 hover:text-gray-600 shrink-0">
                            <GripVertical className="h-5 w-5" />
                        </div>
                        <div className="flex-1 grid grid-cols-12 gap-2 min-w-0">
                            <input
                                value={ing.name}
                                onChange={(e) =>
                                    onIngredientsChange((prev) =>
                                        prev.map((v) => (v.id === ing.id ? { ...v, name: e.target.value } : v))
                                    )
                                }
                                placeholder="材料名"
                                className="col-span-6 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                value={ing.quantity}
                                onChange={(e) =>
                                    onIngredientsChange((prev) =>
                                        prev.map((v) => (v.id === ing.id ? { ...v, quantity: e.target.value } : v))
                                    )
                                }
                                placeholder="量"
                                className="col-span-3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                value={ing.unit}
                                onChange={(e) =>
                                    onIngredientsChange((prev) =>
                                        prev.map((v) => (v.id === ing.id ? { ...v, unit: e.target.value } : v))
                                    )
                                }
                                placeholder="単位"
                                className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {ingredients.length > 1 && (
                            <button
                                type="button"
                                onClick={() => onRemoveIngredient(ing.id)}
                                className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={onAddIngredient}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50"
            >
                <Plus className="h-4 w-4" /> 材料を追加
            </button>
            <p className="text-xs text-gray-500">ドラッグ&ドロップで順番を入れ替えられます</p>
        </section>
    );
}
