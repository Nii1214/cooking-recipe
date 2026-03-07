/**
 * レシピに紐づく材料
 */
export interface Ingredient {
    id: string;
    /** 材料マスター（ingredients テーブル）への参照。未紐付けの場合は undefined */
    ingredientId?: string;
    /** ユーザーが入力した表示用の材料名。例: "人参（みじん切り）" */
    name: string;
    /** 表示用の量。"適量" や "少々" などの文字列も入る。例: "1.5", "適量" */
    quantityDisplay: string;
    /** 数値計算用の量。"適量" など数値化できない場合は undefined */
    quantityValue?: number;
    unit: string;
    note?: string;
    order: number;
}