/**
 * レシピの調理手順
 */
export interface Instruction {
    /** UPDATE / DELETE に必要なため id を持つ */
    id: string;
    stepNumber: number;
    description: string;
    imageUrl?: string;
}