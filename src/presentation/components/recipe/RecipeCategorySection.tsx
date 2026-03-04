"use client";

import { Tag, X } from "lucide-react";
import type { CategoryUI } from "./recipe-create-types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    const categoriesByGroup = categories.reduce((acc, cat) => {
        if (!acc[cat.group]) acc[cat.group] = [];
        acc[cat.group].push(cat);
        return acc;
    }, {} as Record<string, CategoryUI[]>);

    return (
        <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">カテゴリ</h2>
            <div className="space-y-3">
                {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedCategories.map((catId) => {
                            const cat = categories.find((c) => c.id === catId);
                            return cat ? (
                                <Badge key={catId} variant="secondary" className="pr-1 py-1 bg-blue-100 text-blue-800 border-0 hover:bg-blue-100">
                                    {cat.name}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onToggleCategory(catId);
                                        }}
                                        className="rounded-full hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 ml-0.5 inline-flex items-center justify-center size-5"
                                        aria-label="カテゴリを解除"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </Badge>
                            ) : null;
                        })}
                    </div>
                )}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full min-h-[5rem] border-dashed flex flex-col gap-2 py-6 text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                        >
                            <Tag className="size-8" />
                            <span className="text-sm font-medium">カテゴリを追加</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 gap-0">
                        <DialogHeader className="px-6 py-4 border-b border-border">
                            <DialogTitle>カテゴリを選択</DialogTitle>
                            <DialogDescription>複数選択できます</DialogDescription>
                        </DialogHeader>
                        <div className="overflow-y-auto p-6 space-y-6">
                            {Object.entries(categoriesByGroup).map(([group, cats]) => (
                                <div key={group} className="space-y-3">
                                    <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">
                                        {group}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {cats.map((cat) => {
                                            const isSelected = selectedCategories.includes(cat.id);
                                            return (
                                                <Button
                                                    key={cat.id}
                                                    type="button"
                                                    variant={isSelected ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => onToggleCategory(cat.id)}
                                                    className="rounded-full"
                                                >
                                                    {cat.name}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <DialogFooter className="border-t border-border bg-muted/30 px-6 py-4">
                            <DialogTrigger asChild>
                                <Button>決定</Button>
                            </DialogTrigger>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </section>
    );
}
