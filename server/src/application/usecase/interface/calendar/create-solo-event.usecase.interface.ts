export interface ICreateSoloEventUsecase {
  execute(
    userId: string,
    title: string,
    date: string,
    startTime: string
  ): Promise<any>;
}
