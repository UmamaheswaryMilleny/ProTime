export interface IVerifyResetTokenUsecase {
  execute(token: string): Promise<{ email: string; role: string }>;
}
