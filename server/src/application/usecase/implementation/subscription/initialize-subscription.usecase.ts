import { inject, injectable } from 'tsyringe';

import type { IInitializeSubscriptionUsecase } from '../../interface/subscription/initialize-subscription.usecase.interface';
import type { ISubscriptionRepository } from '../../../../domain/repositories/subscription/subscription.repository.interface';
import { SubscriptionPlan, SubscriptionStatus } from '../../../../domain/enums/subscription.enums';

@injectable()
export class InitializeSubscriptionUsecase implements IInitializeSubscriptionUsecase {
    constructor(
        @inject('ISubscriptionRepository')
        private readonly subscriptionRepository: ISubscriptionRepository,
    ) { }

    async execute(userId: string): Promise<void> {
        // Check if subscription already exists to avoid duplicates
        const existing = await this.subscriptionRepository.findByUserId(userId);
        if (existing) return;

        await this.subscriptionRepository.save({
            userId,
            plan: SubscriptionPlan.FREE,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: null,
            currentPeriodEnd: null,
        } as any); // cast to any because id/createdAt/updatedAt are generated
    }
}
