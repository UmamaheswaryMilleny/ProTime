export interface ICheckUserAndSendOtpUsecase {
  execute(data: {
    email: string;
  }): Promise<void>;
}