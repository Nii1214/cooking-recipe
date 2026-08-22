import type { RecipeSummary } from "@/domain/models/recipe/recipe-summary";
import type { Recipe } from "@/domain/models/recipe/recipe";

/** レシピサマリー + お気に入りフラグ + 署名 URL（トップ画面で使用） */
export type RecipeSummaryWithFavorite = RecipeSummary & {
  isFavorited: boolean;
  /** サーバーで生成した署名 GET URL（有効期限付き）。thumbnailPath がない場合は undefined */
  thumbnailUrl?: string;
};

/**
 * presentation 層が domain の型を直接 import しなくて済むように re-export する。
 * （presentation → domain は依存ルール違反だが、presentation → types は OK）
 */
export type { RecipeSummary, Recipe };
