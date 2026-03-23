"use client";

import { useState } from "react";
import NextImage from "next/image";
import { GripVertical, Image as ImageIcon, Plus, X } from "lucide-react";
import type { InstructionUI } from "./recipe-create-types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
    instructions: InstructionUI[];
    onInstructionsChange: React.Dispatch<React.SetStateAction<InstructionUI[]>>;
    onAddInstruction: () => void;
    onAddInstructionImage: (instructionId: string, file: File) => void;
    onRemoveInstructionImage: (instructionId: string, imageIndex: number) => void;
    onRemoveInstruction: (id: string) => void;
};

export function RecipeInstructionsSection({
    instructions,
    onInstructionsChange,
    onAddInstruction,
    onAddInstructionImage,
    onRemoveInstructionImage,
    onRemoveInstruction,
}: Props) {
    const [instructionDraggedIndex, setInstructionDraggedIndex] = useState<number | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };
    const handleInstructionDragStart = (e: React.DragEvent, index: number) => {
        setInstructionDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(index));
    };
    const handleInstructionDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (instructionDraggedIndex === null || instructionDraggedIndex === dropIndex) {
            setInstructionDraggedIndex(null);
            return;
        }
        onInstructionsChange((prev) => {
            const next = [...prev];
            const [draggedItem] = next.splice(instructionDraggedIndex, 1);
            next.splice(dropIndex, 0, draggedItem);
            return next.map((inst, idx) => ({ ...inst, stepNumber: idx + 1 }));
        });
        setInstructionDraggedIndex(null);
    };

    return (
        <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">作り方</h2>
            <div className="space-y-2">
                {instructions.map((inst, index) => (
                    <div
                        key={inst.id}
                        draggable
                        onDragStart={(e) => handleInstructionDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleInstructionDrop(e, index)}
                        onDragEnd={() => setInstructionDraggedIndex(null)}
                        className={cn(
                            "rounded-lg border transition-all bg-card overflow-hidden flex items-stretch",
                            instructionDraggedIndex === index
                                ? "border-primary bg-primary/5 opacity-80"
                                : "border-border hover:border-muted-foreground/50"
                        )}
                    >
                        <div className="flex items-center shrink-0 w-10 py-3 pl-3 pr-2 border-r border-border bg-muted/30 cursor-move justify-center">
                            <GripVertical className="size-5 text-muted-foreground hover:text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex items-center justify-between px-4 pt-3 pb-1 border-b border-border">
                                <span className="text-sm font-semibold text-foreground tabular-nums">
                                    手順 {inst.stepNumber}
                                </span>
                                {instructions.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => onRemoveInstruction(inst.id)}
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        aria-label="手順を削除"
                                    >
                                        <X className="size-4" />
                                    </Button>
                                )}
                            </div>
                            <div className="p-4 space-y-4">
                                <Textarea
                                    value={inst.description}
                                    onChange={(e) =>
                                        onInstructionsChange((prev) =>
                                            prev.map((v) =>
                                                v.id === inst.id ? { ...v, description: e.target.value } : v
                                            )
                                        )
                                    }
                                    placeholder="手順の説明を入力"
                                    rows={5}
                                    className="min-h-[120px] resize-y"
                                />
                                <div className="space-y-3">
                                    {inst.images.length > 0 && (
                                        <div className="space-y-3">
                                            {inst.images.map((img, imgIndex) => (
                                                <div
                                                    key={imgIndex}
                                                    className="relative w-full aspect-video max-h-64 rounded-lg border border-border overflow-hidden bg-muted"
                                                >
                                                    <NextImage
                                                        src={img.preview}
                                                        alt={`手順${inst.stepNumber}の画像${imgIndex + 1}`}
                                                        fill
                                                        unoptimized
                                                        className="object-contain"
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        onClick={() => onRemoveInstructionImage(inst.id, imgIndex)}
                                                        className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70 size-8"
                                                        aria-label="画像を削除"
                                                    >
                                                        <X className="size-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <label className="w-full min-h-[5rem] rounded-lg border-2 border-dashed border-input bg-background flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 hover:bg-accent/50 cursor-pointer transition-colors py-6">
                                        <ImageIcon className="size-8" />
                                        <span className="text-sm font-medium">画像を追加</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) onAddInstructionImage(inst.id, file);
                                                e.target.value = "";
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Button type="button" variant="outline" className="w-full border-dashed" onClick={onAddInstruction}>
                <Plus className="size-4" /> 手順を追加
            </Button>
            <p className="text-xs text-muted-foreground">ドラッグ&ドロップで順番を入れ替えられます</p>
        </section>
    );
}
