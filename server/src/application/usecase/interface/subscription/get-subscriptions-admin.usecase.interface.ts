export interface IGetSubscriptionsAdminUsecase {
  execute(params: {
    plan?:   string;
    status?: string;
    search?: string;
    page:    number;
    limit:   number;
  }): Promise<{
    subscriptions: any[];
    total:         number;
  }>;
}
