"use client";

import NextImage from "next/image";
import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
    title: string;
    setTitle: (v: string) => void;
    minutes: number | "";
    setMinutes: (v: number | "") => void;
    servingCount: number | "";
    setServingCount: (v: number | "") => void;
    comment: string;
    setComment: (v: string) => void;
    imagePreview: string | null;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onImageClear: () => void;
};

export function RecipeGeneralSection({
    title,
    setTitle,
    minutes,
    setMinutes,
    servingCount,
    setServingCount,
    comment,
    setComment,
    imagePreview,
    onImageChange,
    onImageClear,
}: Props) {
    return (
        <section className="space-y-4">
            <div className="space-y-3">
                <div className="space-y-2">
                    <Label htmlFor="title">
                        料理名 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="例: 祖母の肉じゃが"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>料理の画像</Label>
                        {imagePreview ? (
                            <div className="relative h-40 w-full">
                                <NextImage src={imagePreview} alt="Preview" fill unoptimized className="object-cover rounded-md" />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    onClick={onImageClear}
                                    className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70 size-8"
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                        ) : (
                            <Label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-input rounded-md cursor-pointer hover:bg-accent/50 transition-colors">
                                <ImageIcon className="size-10 text-muted-foreground mb-2" />
                                <span className="text-sm text-muted-foreground">画像をアップロード</span>
                                <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                            </Label>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="minutes">調理時間（分）</Label>
                            <Input
                                id="minutes"
                                type="number"
                                inputMode="numeric"
                                value={minutes}
                                onChange={(e) => setMinutes(e.target.value === "" ? "" : Number(e.target.value))}
                                min={1}
                                placeholder="例: 30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="serving-count">
                                何人前 <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="serving-count"
                                type="number"
                                inputMode="numeric"
                                value={servingCount}
                                onChange={(e) => setServingCount(e.target.value === "" ? "" : Number(e.target.value))}
                                min={1}
                                required
                                placeholder="例: 2"
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="comment">レシピコメント</Label>
                    <Textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        className="resize-none"
                        placeholder="例: 甘めの味付けでほっとする定番。思い出の味。"
                    />
                </div>
            </div>
        </section>
    );
}
