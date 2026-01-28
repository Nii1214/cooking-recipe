import { LoginInput, SignupInput, User } from "@/types/auth";

export interface AuthRepository {
    signup(input: SignupInput): Promise<User>;
    login(input: LoginInput) : Promise<User>;
    findByEmail(email: string): Promise<User | null>;
}