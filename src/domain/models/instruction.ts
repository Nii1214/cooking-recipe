/**
 * 料理の手順
 */
export interface Instruction {
    stepNumber: number; // 手順番号
    description: string;  // 説明
    imageUrl?: string; // 各ステップの補足画像
}