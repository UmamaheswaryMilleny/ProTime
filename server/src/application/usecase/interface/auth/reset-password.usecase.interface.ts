

export interface IResetPasswordUsecase {
execute(token: string, newPassword: string): Promise<void>;

}
