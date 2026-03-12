import { inject, injectable } from 'tsyringe';

import type { IGetSubscriptionUsecase } from '../../interface/subscription/get-subscription.usecase.interface';
import type { ISubscriptionRepository } from '../../../../domain/repositories/subscription/subscription.repository.interface';
import type { SubscriptionResponseDTO } from '../../../dto/subscription/response/subscription.response.dto';
import { SubscriptionMapper } from '../../../mapper/subscription.mapper';
import { SubscriptionNotFoundError } from '../../../../domain/errors/subscription.error';

@injectable()
export class GetSubscriptionUsecase implements IGetSubscriptionUsecase {
  constructor(
    @inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(userId: string): Promise<SubscriptionResponseDTO> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    if (!subscription) throw new SubscriptionNotFoundError();

    return SubscriptionMapper.toResponse(subscription);
  }
}
