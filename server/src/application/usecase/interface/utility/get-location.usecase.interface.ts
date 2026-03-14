
export interface IGetLocationUsecase {
  execute(): Promise<{ country: string }>;
}
