import { inject, injectable } from 'tsyringe';

import type { IGetSubscriptionUsecase } from '../../interface/subscription/get-subscription.usecase.interface';
import type { ISubscriptionRepository } from '../../../../domain/repositories/subscription/subscription.repository.interface';
import type { SubscriptionResponseDTO } from '../../../dto/subscription/response/subscription.response.dto';
import { SubscriptionMapper } from '../../../mapper/subscription.mapper';
// import { SubscriptionNotFoundError } from '../../../../domain/errors/subscription.error';
import type { IInitializeSubscriptionUsecase } from '../../interface/subscription/initialize-subscription.usecase.interface';

@injectable()
export class GetSubscriptionUsecase implements IGetSubscriptionUsecase {
  constructor(
    @inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
    @inject('IInitializeSubscriptionUsecase')
    private readonly initializeSubscriptionUsecase: IInitializeSubscriptionUsecase,
  ) { }

  async execute(userId: string): Promise<SubscriptionResponseDTO> {
    let subscription = await this.subscriptionRepository.findByUserId(userId);

    if (!subscription) {
      await this.initializeSubscriptionUsecase.execute(userId);
      subscription = await this.subscriptionRepository.findByUserId(userId);
    }

    if (!subscription) {
      // This should not happen after initialize, but as a fallback
      throw new Error('Failed to initialize subscription');
    }

    return SubscriptionMapper.toResponse(subscription);
  }
}
