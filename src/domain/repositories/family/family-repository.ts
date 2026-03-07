import type { Family } from "@/domain/models/family/family";

export type CreateFamilyInput = {
    name: string;
    /** グループ作成者。usecase 層が auth.uid() を渡す */
    ownerId: string;
};

export interface FamilyRepository {
    /**
     * ユーザーが所属する家族グループを取得する
     * 未所属の場合は null を返す
     */
    findByUserId(userId: string): Promise<Family | null>;

    /**
     * 家族グループを作成する
     * メンバーへの追加は usecase 層で FamilyMemberRepository を通じて行う
     */
    create(input: CreateFamilyInput): Promise<Family>;
}
