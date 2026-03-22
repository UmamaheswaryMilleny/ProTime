import { UserRole } from "../../domain/enums/user.enums";
export interface TempUser {
  fullName:string;
  passwordHash: string;
  role: UserRole;
  // role: string;
}

export interface ITempUserService{
  storeUser(email: string, data:TempUser,ttlSeconds: number): Promise<void>;
  getUser(email: string): Promise<TempUser | null>;
  deleteUser(email: string): Promise<void>;
}

