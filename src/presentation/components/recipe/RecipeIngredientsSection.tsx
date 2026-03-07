"use client";

import { useState } from "react";
import { GripVertical, Plus } from "lucide-react";
import type { IngredientUI } from "./recipe-create-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
            <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">
                材料 <span className="text-destructive">*</span>
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
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-all bg-card",
                            draggedIndex === index ? "border-primary bg-primary/5 opacity-80" : "border-border hover:border-muted-foreground/50"
                        )}
                    >
                        <div className="cursor-move text-muted-foreground hover:text-foreground shrink-0">
                            <GripVertical className="size-5" />
                        </div>
                        <div className="flex-1 grid grid-cols-12 gap-2 min-w-0">
                            <Input
                                value={ing.name}
                                onChange={(e) =>
                                    onIngredientsChange((prev) =>
                                        prev.map((v) => (v.id === ing.id ? { ...v, name: e.target.value } : v))
                                    )
                                }
                                placeholder="材料名"
                                className="col-span-6"
                            />
                            <Input
                                value={ing.quantity}
                                onChange={(e) =>
                                    onIngredientsChange((prev) =>
                                        prev.map((v) => (v.id === ing.id ? { ...v, quantity: e.target.value } : v))
                                    )
                                }
                                placeholder="量"
                                className="col-span-3"
                            />
                            <Input
                                value={ing.unit}
                                onChange={(e) =>
                                    onIngredientsChange((prev) =>
                                        prev.map((v) => (v.id === ing.id ? { ...v, unit: e.target.value } : v))
                                    )
                                }
                                placeholder="単位"
                                className="col-span-2"
                            />
                        </div>
                        {ingredients.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => onRemoveIngredient(ing.id)}
                                className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                ×
                            </Button>
                        )}
                    </div>
                ))}
            </div>
            <Button type="button" variant="outline" className="w-full border-dashed" onClick={onAddIngredient}>
                <Plus className="size-4" /> 材料を追加
            </Button>
            <p className="text-xs text-muted-foreground">ドラッグ&ドロップで順番を入れ替えられます</p>
        </section>
    );
}
