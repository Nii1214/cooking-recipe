import type { RecipeSummary } from "@/domain/models/recipe/recipe-summary";
import type { Recipe } from "@/domain/models/recipe/recipe";

/** レシピサマリー + お気に入りフラグ（トップ画面で使用） */
export type RecipeSummaryWithFavorite = RecipeSummary & {
  isFavorited: boolean;
};

/**
 * presentation 層が domain の型を直接 import しなくて済むように re-export する。
 * （presentation → domain は依存ルール違反だが、presentation → types は OK）
 */
export type { RecipeSummary, Recipe };
