export interface ICanEarnXpForTaskUsecase {
  execute(params: {
    userId: string;
    priority: "low" | "medium" | "high";
    date: Date;
  }): Promise<boolean>;
}
