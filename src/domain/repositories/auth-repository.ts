import { SignupInput, User } from "@/src/types/auth";

export interface AuthRepository {
    signup(input: SignupInput): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
}