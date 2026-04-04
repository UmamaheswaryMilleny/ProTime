import { inject, injectable } from 'tsyringe';

import type { IGetSubscriptionsAdminUsecase } from '../../interface/subscription/get-subscriptions-admin.usecase.interface';
import type { ISubscriptionRepository } from '../../../../domain/repositories/subscription/subscription.repository.interface';

@injectable()
export class GetSubscriptionsAdminUsecase implements IGetSubscriptionsAdminUsecase {
  constructor(
    @inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(params: {
    plan?:   string;
    status?: string;
    search?: string;
    page:    number;
    limit:   number;
  }): Promise<{
    subscriptions: any[];
    total:         number;
  }> {
    return this.subscriptionRepository.findAllWithUser(params);
  }
}
