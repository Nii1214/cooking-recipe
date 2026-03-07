/**
 * 家族グループ
 */
export interface Family {
    id: string;
    name: string;
    /** グループのオーナー。グループ名の変更などができる */
    ownerId: string;
    createdAt: Date;
}
