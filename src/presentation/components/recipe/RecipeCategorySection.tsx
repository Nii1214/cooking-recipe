"use client";

import { useEffect, useRef, useState } from "react";
import { Tag, X } from "lucide-react";
import type { CategoryUI } from "./recipe-create-types";

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

type Props = {
    selectedCategories: string[];
    onToggleCategory: (categoryId: string) => void;
};

export function RecipeCategorySection({ selectedCategories, onToggleCategory }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const modalTriggerRef = useRef<HTMLButtonElement>(null);

    const categoriesByGroup = categories.reduce((acc, cat) => {
        if (!acc[cat.group]) acc[cat.group] = [];
        acc[cat.group].push(cat);
        return acc;
    }, {} as Record<string, CategoryUI[]>);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isModalOpen) {
                setIsModalOpen(false);
                modalTriggerRef.current?.focus();
            }
        };

        if (isModalOpen) {
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
    }, [isModalOpen]);

    const closeModal = () => {
        setIsModalOpen(false);
        modalTriggerRef.current?.focus();
    };

    return (
        <>
            <section className="space-y-3">
                <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">カテゴリ</h2>
                <div className="space-y-3">
                    {selectedCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedCategories.map((catId) => {
                                const cat = categories.find((c) => c.id === catId);
                                return cat ? (
                                    <span
                                        key={catId}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800"
                                    >
                                        {cat.name}
                                        <button
                                            type="button"
                                            onClick={() => onToggleCategory(catId)}
                                            className="hover:text-blue-600 rounded p-0.5"
                                            aria-label="カテゴリを解除"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </span>
                                ) : null;
                            })}
                        </div>
                    )}
                    <button
                        ref={modalTriggerRef}
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="w-full min-h-[5rem] rounded-lg border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-gray-50/80 transition-colors py-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                    >
                        <Tag className="h-8 w-8" />
                        <span className="text-sm font-medium">カテゴリを追加</span>
                    </button>
                </div>
            </section>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={closeModal} />
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
                                onClick={closeModal}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="閉じる"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {Object.entries(categoriesByGroup).map(([group, cats]) => (
                                <div key={group} className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">
                                        {group}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {cats.map((cat) => {
                                            const isSelected = selectedCategories.includes(cat.id);
                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => onToggleCategory(cat.id)}
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
                                onClick={closeModal}
                                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                決定
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
