export type IngredientInput = {
    id: string;
    name: string;      // 例: 人参
    quantity: string;  // 例: 1.5
    unit: string;      // 例: 本、g、小さじ1
    note?: string;     // 例: 乱切りにしておく
    order: number;     // 並び順
}