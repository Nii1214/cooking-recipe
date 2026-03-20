import type { Category } from "./category";

/**
 * レシピ一覧画面向けのサマリー。
 * 材料・手順は含まない（一覧では不要なため）。
 */
export interface RecipeSummary {
  id: string;
  title: string;
  description: string;
  thumbnailPath?: string;
  servingCount: number;
  preparationTimeMinutes: number;
  isDraft: boolean;
  authorId: string;
  categories: Category[];
  createdAt: Date;
  updatedAt: Date;
}
