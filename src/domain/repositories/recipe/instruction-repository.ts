export type InstructionInput = {
    /** UPDATE / DELETE に必要 */
    id?: string;
    stepNumber: number;
    description: string;
    imageUrl?: string;
}
