"use client";

import { Image as ImageIcon, X } from "lucide-react";

type Props = {
    title: string;
    setTitle: (v: string) => void;
    minutes: number | "";
    setMinutes: (v: number | "") => void;
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
    comment,
    setComment,
    imagePreview,
    onImageChange,
    onImageClear,
}: Props) {
    return (
        <section className="space-y-4">
            <div className="space-y-3">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        料理名 <span className="text-red-500">*</span>
                    </label>
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
                                <button
                                    type="button"
                                    onClick={onImageClear}
                                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600">画像をアップロード</span>
                                <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                            </label>
                        )}
                    </div>
                    <div>
                        <label htmlFor="minutes" className="block text-sm font-medium text-gray-700 mb-1">
                            調理時間（分）
                        </label>
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
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                        レシピコメント
                    </label>
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
    );
}
