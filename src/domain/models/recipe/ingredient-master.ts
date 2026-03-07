/**
 * 材料マスター
 * サジェスト検索・材料の表記ゆれ吸収・将来の横断検索に使用する
 * recipe_ingredients.ingredientId から任意で参照される
 */
export interface IngredientMaster {
    id: string;
    /** 標準表示名。例: "人参" */
    name: string;
    /** 検索・突合せ用の正規化名。小文字化・表記ゆれ統一後。例: "にんじん" */
    normalizedName: string;
    createdAt: Date;
}
