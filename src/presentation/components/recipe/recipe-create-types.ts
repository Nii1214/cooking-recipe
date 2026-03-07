export type IngredientUI = {
    id: string;
    name: string;
    quantity: string;
    unit: string;
    note?: string;
    order: number;
};

export type InstructionImage = {
    preview: string;
    file: File;
};

export type InstructionUI = {
    id: string;
    stepNumber: number;
    description: string;
    images: InstructionImage[];
};

export type CategoryUI = {
    id: string;
    name: string;
    group: "ジャンル" | "イベント" | "分類" | "種類";
};
