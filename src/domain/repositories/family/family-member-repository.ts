import type { FamilyMember } from "@/domain/models/family/family-member";

export interface FamilyMemberRepository {
    /**
     * 家族グループのメンバー一覧を取得する
     */
    findByFamilyId(familyId: string): Promise<FamilyMember[]>;

    /**
     * メンバーを追加する
     * グループ作成時に作成者を追加する際や、招待リンク経由の参加時に使用する
     */
    add(familyId: string, userId: string): Promise<void>;

    /**
     * メンバーを削除する
     * 脱退時に使用する
     */
    remove(familyId: string, userId: string): Promise<void>;
}
