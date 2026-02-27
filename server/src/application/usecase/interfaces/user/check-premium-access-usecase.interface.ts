
export interface ICheckPremiumAccessUsecase {
  execute(userId: string): Promise<boolean>;
}
