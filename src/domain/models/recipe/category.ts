/**
 * 料理カテゴリ
 * @example 時短、誕生日等
 */
export interface Category {
    id: string;
    name: string;
    slug: string; // URL等で使う識別子
}