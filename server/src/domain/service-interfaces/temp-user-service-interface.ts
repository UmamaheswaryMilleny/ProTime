export interface ITempUserService {
  storeUser(email: string, data: any): Promise<void>;
  getUser(email: string): Promise<any | null>;
  deleteUser(email: string): Promise<void>;
}
