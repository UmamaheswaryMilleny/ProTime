
export interface IVerifyOtpUsecase {
  execute(data:{email: string, otp: string}): Promise<void>;
}