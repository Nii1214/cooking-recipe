"use client";

import { useEffect, useRef, useState } from "react";
import { GripVertical, Image as ImageIcon, Plus, X } from "lucide-react";

type IngredientUI = {
    id: string;
    name: string;
    quantity: string;
    unit: string;
    order: number;
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
            className="rounded-xl bg-white p-8 shadow-sm border border-gray-100 space-y-8"
            onSubmit={(e) => {
                e.preventDefault();
                console.log("Submit(UIのみ):", { title, minutes, comment, selectedCategories, ingredients, imageFile });
            }}
        >
            {/* 料理名 */}
            <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
                    料理名 <span className="text-red-500">*</span>
                </label>
                <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 祖母の肉じゃが"
                />
            </div>

            {/* 画像と調理時間 */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">料理の画像</label>
                    <div className="space-y-3">
                        {imagePreview ? (
                            <div className="relative">
                                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageFile(null);
                                        setImagePreview(null);
                                    }}
                                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600">画像をアップロード</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="minutes" className="block text-sm font-semibold text-gray-900">
                        調理時間（分）
                    </label>
                    <input
                        id="minutes"
                        type="number"
                        inputMode="numeric"
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value === "" ? "" : Number(e.target.value))}
                        min="1"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="例: 30"
                    />
                </div>
            </div>

            {/* レシピコメント */}
            <div className="space-y-2">
                <label htmlFor="comment" className="block text-sm font-semibold text-gray-900">
                    レシピコメント
                </label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="例: 甘めの味付けでほっとする定番。小さい頃、運動会の日に必ず作ってくれた思い出の味。"
                />
            </div>

            {/* レシピカテゴリ（モーダル） */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">レシピカテゴリ（表示のみ）</label>
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        ref={modalTriggerRef}
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        カテゴリを選択
                    </button>

                    {selectedCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedCategories.map((catId) => {
                                const cat = categories.find((c) => c.id === catId);
                                return cat ? (
                                    <span
                                        key={catId}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                                    >
                                        {cat.name}
                                        <button type="button" onClick={() => toggleCategory(catId)} className="hover:text-blue-600">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ) : null;
                            })}
                        </div>
                    )}
                </div>
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

            {/* 材料（ドラッグ&ドロップ） */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-900">
                        材料 <span className="text-red-500">*</span>
                    </label>
                    <button
                        type="button"
                        onClick={addIngredient}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <Plus className="h-4 w-4" />
                        追加
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
                                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                                draggedIndex === index ? "border-blue-500 bg-blue-50 shadow-md opacity-50" : "border-gray-200 bg-white hover:border-gray-300",
                            ].join(" ")}
                        >
                            <div className="cursor-move text-gray-400 hover:text-gray-600">
                                <GripVertical className="h-5 w-5" />
                            </div>

                            <div className="flex-1 grid grid-cols-12 gap-2">
                                <input
                                    value={ing.name}
                                    onChange={(e) =>
                                        setIngredients((prev) => prev.map((v) => (v.id === ing.id ? { ...v, name: e.target.value } : v)))
                                    }
                                    placeholder="材料名"
                                    className="col-span-6 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    value={ing.quantity}
                                    onChange={(e) =>
                                        setIngredients((prev) =>
                                            prev.map((v) => (v.id === ing.id ? { ...v, quantity: e.target.value } : v))
                                        )
                                    }
                                    placeholder="量"
                                    className="col-span-3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    value={ing.unit}
                                    onChange={(e) =>
                                        setIngredients((prev) => prev.map((v) => (v.id === ing.id ? { ...v, unit: e.target.value } : v)))
                                    }
                                    placeholder="単位"
                                    className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {ingredients.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeIngredient(ing.id)}
                                    className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <p className="text-xs text-gray-500">材料をドラッグ&ドロップで順番を入れ替えられます</p>
            </div>

            {/* 送信ボタン（UIのみ） */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-4 border-t border-gray-200">
                <button type="button" className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    下書き保存（未実装）
                </button>
                <button type="submit" className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    レシピを登録（未接続）
                </button>
            </div>
        </form>
    );
}