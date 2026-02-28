"use client";

import { useState } from "react";
import { GripVertical, Image as ImageIcon, Plus, X } from "lucide-react";
import type { InstructionUI } from "./recipe-create-types";

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
            <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">作り方</h2>
            <div className="space-y-2">
                {instructions.map((inst, index) => (
                    <div
                        key={inst.id}
                        draggable
                        onDragStart={(e) => handleInstructionDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleInstructionDrop(e, index)}
                        onDragEnd={() => setInstructionDraggedIndex(null)}
                        className={[
                            "rounded-lg border transition-all bg-white overflow-hidden flex items-stretch",
                            instructionDraggedIndex === index
                                ? "border-blue-500 bg-blue-50/30 opacity-80"
                                : "border-gray-200 hover:border-gray-300",
                        ].join(" ")}
                    >
                        <div className="flex items-center shrink-0 w-10 py-3 pl-3 pr-2 border-r border-gray-100 bg-gray-50/50 cursor-move justify-center">
                            <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex items-center justify-between px-4 pt-3 pb-1 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-700 tabular-nums">
                                    手順 {inst.stepNumber}
                                </span>
                                {instructions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => onRemoveInstruction(inst.id)}
                                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                        aria-label="手順を削除"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <div className="p-4 space-y-4">
                                <textarea
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
                                    className="w-full min-h-[120px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                                />
                                <div className="space-y-3">
                                    {inst.images.length > 0 && (
                                        <div className="space-y-3">
                                            {inst.images.map((img, imgIndex) => (
                                                <div
                                                    key={imgIndex}
                                                    className="relative w-full aspect-video max-h-64 rounded-lg border border-gray-200 overflow-hidden bg-gray-100"
                                                >
                                                    <img
                                                        src={img.preview}
                                                        alt={`手順${inst.stepNumber}の画像${imgIndex + 1}`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => onRemoveInstructionImage(inst.id, imgIndex)}
                                                        className="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                                                        aria-label="画像を削除"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <label className="w-full min-h-[5rem] rounded-lg border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-gray-50/80 cursor-pointer transition-colors py-6">
                                        <ImageIcon className="h-8 w-8" />
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
            <button
                type="button"
                onClick={onAddInstruction}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50"
            >
                <Plus className="h-4 w-4" /> 手順を追加
            </button>
            <p className="text-xs text-gray-500">ドラッグ&ドロップで順番を入れ替えられます</p>
        </section>
    );
}
