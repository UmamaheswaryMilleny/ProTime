

export interface IRefreshTokenStore {
  save(userId: string, refreshToken: string, ttlSeconds: number): Promise<void>;

  exists(userId: string, refreshToken: string): Promise<boolean>;

  delete(userId: string, refreshToken: string): Promise<void>;

  // removes every refresh token for a user at once:"logout from all devices"
  deleteAll(userId: string): Promise<void>;
}