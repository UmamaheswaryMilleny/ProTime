import type { SubscriptionResponseDTO } from '../../../dto/subscription/response/subscription.response.dto';

export interface IGetSubscriptionUsecase {
  execute(userId: string): Promise<SubscriptionResponseDTO>;
}