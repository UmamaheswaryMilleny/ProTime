export interface TempUser {
  fullName:string;
  passwordHash: string;
  role: string;
}

export interface ITempUserService{
  storeUser(email: string, data:TempUser,ttlSeconds: number): Promise<void>;
  getUser(email: string): Promise<any | null>;
  deleteUser(email: string): Promise<void>;
}

