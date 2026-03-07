export type IngredientInput = {
    /** 材料マスターへの参照。自由入力の場合は undefined */
    ingredientId?: string;
    /** ユーザーが入力した表示用の材料名 */
    name: string;
    /** 表示用の量。"適量" などの文字列も入る */
    quantityDisplay: string;
    /** 数値計算用の量。数値化できない場合は undefined */
    quantityValue?: number;
    unit: string;
    note?: string;
    order: number;
}