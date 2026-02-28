"use client";

import { useEffect, useRef, useState } from "react";
import { GripVertical, Image as ImageIcon, Plus, Tag, X } from "lucide-react";

type IngredientUI = {
    id: string;
    name: string;
    quantity: string;
    unit: string;
    order: number;
};

type InstructionImage = {
    preview: string;
    file: File;
};

type InstructionUI = {
    id: string;
    stepNumber: number;
    description: string;
    images: InstructionImage[];
};

type CategoryUI = {
    id: string;
    name: string;
    group: "ジャンル" | "イベント" | "分類" | "種類";
};

const categories: CategoryUI[] = [
    { id: "1", name: "和食", group: "ジャンル" },
    { id: "2", name: "洋食", group: "ジャンル" },
    { id: "3", name: "中華", group: "ジャンル" },
    { id: "4", name: "誕生日", group: "イベント" },
    { id: "5", name: "クリスマス", group: "イベント" },
    { id: "6", name: "卵料理", group: "分類" },
    { id: "7", name: "肉料理", group: "分類" },
    { id: "8", name: "時短レシピ", group: "種類" },
    { id: "9", name: "作り置き", group: "種類" },
    { id: "10", name: "子ども向け", group: "種類" },
];

export function RecipeCreateForm() {
    const [title, setTitle] = useState("");
    const [minutes, setMinutes] = useState<number | "">("");
    const [comment, setComment] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const modalRef = useRef<HTMLDivElement>(null);
    const modalTriggerRef = useRef<HTMLButtonElement>(null);

    const [ingredients, setIngredients] = useState<IngredientUI[]>([
        { id: crypto.randomUUID(), name: "", quantity: "", unit: "", order: 0 },
    ]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const [instructions, setInstructions] = useState<InstructionUI[]>([
        { id: crypto.randomUUID(), stepNumber: 1, description: "", images: [] },
    ]);
    const [instructionDraggedIndex, setInstructionDraggedIndex] = useState<number | null>(null);

    // 画像プレビュー
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    // 材料追加
    const addIngredient = () => {
        setIngredients((prev) => {
            const next = [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    name: "",
                    quantity: "",
                    unit: "",
                    order: prev.length,
                },
            ];
            return next;
        });
    };

    // 材料削除
    const removeIngredient = (id: string) => {
        setIngredients((prev) => {
            const filtered = prev.filter((ing) => ing.id !== id);
            return filtered.map((ing, idx) => ({ ...ing, order: idx }));
        });
    };

    // D&D
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

        setIngredients((prev) => {
            const next = [...prev];
            const [draggedItem] = next.splice(draggedIndex, 1);
            next.splice(dropIndex, 0, draggedItem);
            return next.map((ing, idx) => ({ ...ing, order: idx }));
        });

        setDraggedIndex(null);
    };
    const handleDragEnd = () => setDraggedIndex(null);

    // 手順
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
        setInstructions((prev) => {
            const next = [...prev];
            const [draggedItem] = next.splice(instructionDraggedIndex, 1);
            next.splice(dropIndex, 0, draggedItem);
            return next.map((inst, idx) => ({ ...inst, stepNumber: idx + 1 }));
        });
        setInstructionDraggedIndex(null);
    };

    // モーダル: Esc で閉じる
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isCategoryModalOpen) {
                setIsCategoryModalOpen(false);
                modalTriggerRef.current?.focus();
            }
        };

        if (isCategoryModalOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
            setTimeout(() => {
                modalRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
            }, 100);
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isCategoryModalOpen]);

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
        );
    };

    const categoriesByGroup = categories.reduce((acc, cat) => {
        if (!acc[cat.group]) acc[cat.group] = [];
        acc[cat.group].push(cat);
        return acc;
    }, {} as Record<string, CategoryUI[]>);

    return (
        <form
            className="rounded-xl bg-white p-6 shadow-sm border border-gray-100"
            onSubmit={(e) => {
                e.preventDefault();
                console.log("Submit(UIのみ):", { title, minutes, comment, selectedCategories, ingredients, instructions, imageFile });
            }}
        >
            <div className="space-y-8">
                {/* セクション: レシピ総合 */}
                <section className="space-y-4">
                    <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">レシピ総合</h2>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">料理名 <span className="text-red-500">*</span></label>
                            <input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="例: 祖母の肉じゃが"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">料理の画像</label>
                                {imagePreview ? (
                                    <div className="relative">
                                        <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">画像をアップロード</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                )}
                            </div>
                            <div>
                                <label htmlFor="minutes" className="block text-sm font-medium text-gray-700 mb-1">調理時間（分）</label>
                                <input
                                    id="minutes"
                                    type="number"
                                    inputMode="numeric"
                                    value={minutes}
                                    onChange={(e) => setMinutes(e.target.value === "" ? "" : Number(e.target.value))}
                                    min="1"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="例: 30"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">レシピコメント</label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="例: 甘めの味付けでほっとする定番。思い出の味。"
                            />
                        </div>
                    </div>
                </section>

                {/* セクション: カテゴリ */}
                <section className="space-y-3">
                    <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">カテゴリ</h2>
                    <div className="space-y-3">
                        {selectedCategories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedCategories.map((catId) => {
                                    const cat = categories.find((c) => c.id === catId);
                                    return cat ? (
                                        <span key={catId} className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800">
                                            {cat.name}
                                            <button type="button" onClick={() => toggleCategory(catId)} className="hover:text-blue-600 rounded p-0.5" aria-label="カテゴリを解除"><X className="h-3.5 w-3.5" /></button>
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        )}
                        <button
                            ref={modalTriggerRef}
                            type="button"
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="w-full min-h-[5rem] rounded-lg border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-gray-50/80 transition-colors py-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                        >
                            <Tag className="h-8 w-8" />
                            <span className="text-sm font-medium">カテゴリを追加</span>
                        </button>
                    </div>
                </section>

                {/* セクション: 材料 */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <h2 className="text-base font-semibold text-gray-900">材料 <span className="text-red-500">*</span></h2>
                        <button type="button" onClick={addIngredient} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Plus className="h-4 w-4" /> 追加
                        </button>
                    </div>
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
                                <div className="cursor-move text-gray-400 hover:text-gray-600 shrink-0"><GripVertical className="h-5 w-5" /></div>
                                <div className="flex-1 grid grid-cols-12 gap-2 min-w-0">
                                    <input value={ing.name} onChange={(e) => setIngredients((prev) => prev.map((v) => (v.id === ing.id ? { ...v, name: e.target.value } : v)))} placeholder="材料名" className="col-span-6 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <input value={ing.quantity} onChange={(e) => setIngredients((prev) => prev.map((v) => (v.id === ing.id ? { ...v, quantity: e.target.value } : v)))} placeholder="量" className="col-span-3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <input value={ing.unit} onChange={(e) => setIngredients((prev) => prev.map((v) => (v.id === ing.id ? { ...v, unit: e.target.value } : v)))} placeholder="単位" className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                {ingredients.length > 1 && (
                                    <button type="button" onClick={() => removeIngredient(ing.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 shrink-0"><X className="h-4 w-4" /></button>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500">ドラッグ&ドロップで順番を入れ替えられます</p>
                </section>

                {/* セクション: 手順 */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <h2 className="text-base font-semibold text-gray-900">手順</h2>
                        <button type="button" onClick={addInstruction} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Plus className="h-4 w-4" /> 追加
                        </button>
                    </div>
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
                                    "rounded-lg border transition-all bg-white overflow-hidden",
                                    instructionDraggedIndex === index ? "border-blue-500 bg-blue-50/30 opacity-80" : "border-gray-200 hover:border-gray-300",
                                ].join(" ")}
                            >
                                <div className="flex items-start gap-3 p-3">
                                    <div className="cursor-move text-gray-400 hover:text-gray-600 shrink-0 w-6 text-center text-sm font-medium text-gray-500 pt-2">{inst.stepNumber}</div>
                                    <div className="cursor-move shrink-0 text-gray-400 pt-2"><GripVertical className="h-5 w-5" /></div>
                                    {instructions.length > 1 && (
                                        <button type="button" onClick={() => removeInstruction(inst.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 shrink-0 mt-1 ml-auto" aria-label="手順を削除"><X className="h-4 w-4" /></button>
                                    )}
                                </div>
                                <div className="rounded-b-lg border-t border-gray-100 bg-gray-50/50 p-4 space-y-4">
                                    <textarea
                                        value={inst.description}
                                        onChange={(e) => setInstructions((prev) => prev.map((v) => (v.id === inst.id ? { ...v, description: e.target.value } : v)))}
                                        placeholder="手順の説明を入力"
                                        rows={5}
                                        className="w-full min-h-[120px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                                    />
                                    <div className="space-y-3">
                                        {inst.images.length > 0 && (
                                            <div className="space-y-3">
                                                {inst.images.map((img, imgIndex) => (
                                                    <div key={imgIndex} className="relative w-full aspect-video max-h-64 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                                                        <img src={img.preview} alt={`手順${inst.stepNumber}の画像${imgIndex + 1}`} className="w-full h-full object-contain" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeInstructionImage(inst.id, imgIndex)}
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
                                                    if (file) addInstructionImage(inst.id, file);
                                                    e.target.value = "";
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500">ドラッグ&ドロップで順番を入れ替えられます</p>
                </section>

                {/* セクション: 登録ボタン */}
                <section className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200">
                    <button type="button" className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 order-2 sm:order-1">
                        下書き保存（未実装）
                    </button>
                    <button type="submit" className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 order-1 sm:order-2">
                        レシピを登録（未接続）
                    </button>
                </section>
            </div>

            {/* カテゴリ選択モーダル */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
                    <div
                        className="fixed inset-0 bg-black/50 transition-opacity"
                        onClick={() => {
                            setIsCategoryModalOpen(false);
                            modalTriggerRef.current?.focus();
                        }}
                    />
                    <div
                        ref={modalRef}
                        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-xl"
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">カテゴリを選択</h2>
                                <p className="text-xs text-gray-600 mt-1">複数選択できます</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCategoryModalOpen(false);
                                    modalTriggerRef.current?.focus();
                                }}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="閉じる"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {Object.entries(categoriesByGroup).map(([group, cats]) => (
                                <div key={group} className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">{group}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {cats.map((cat) => {
                                            const isSelected = selectedCategories.includes(cat.id);
                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => toggleCategory(cat.id)}
                                                    className={[
                                                        "rounded-full px-4 py-2 text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                        isSelected
                                                            ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                                                    ].join(" ")}
                                                >
                                                    {cat.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCategoryModalOpen(false);
                                    modalTriggerRef.current?.focus();
                                }}
                                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                決定
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}