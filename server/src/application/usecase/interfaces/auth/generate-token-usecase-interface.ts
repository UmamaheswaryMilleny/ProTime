export interface IGenerateTokenUseCase {
  execute(
    id: string,
    email: string,
    role: string,
    status?: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
}