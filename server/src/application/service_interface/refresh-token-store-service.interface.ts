

export interface IRefreshTokenStore {
  save(userId: string, refreshToken: string, ttlSeconds: number): Promise<void>;

  exists(userId: string, refreshToken: string): Promise<boolean>;

  delete(userId: string, refreshToken: string): Promise<void>;

  deleteAll(userId: string): Promise<void>;
}