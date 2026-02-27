export interface IResetTokenStore {
  save(
    userId: string,
    token: string,
    ttlSeconds: number
  ): Promise<void>;

  exists(
    userId: string,
    token: string
  ): Promise<boolean>;

  delete(userId: string): Promise<void>;
}