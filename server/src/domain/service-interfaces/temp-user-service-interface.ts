export interface TempUserData {
  fullName: string;
  password: string;
  otp?: string;
}


export interface ITempUserService {
  storeUser(email: string, data: TempUserData): Promise<void>;
  getUser(email: string): Promise<TempUserData | null>;
  deleteUser(email: string): Promise<void>;
}
