import type { IngredientMaster } from "@/domain/models/recipe/ingredient-master";

export interface IngredientMasterRepository {
    /**
     * 材料名でサジェスト検索する
     * 入力中のキーワードに部分一致する材料マスターを返す
     */
    search(query: string): Promise<IngredientMaster[]>;
}
