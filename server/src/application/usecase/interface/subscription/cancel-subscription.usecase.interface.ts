import type { SubscriptionResponseDTO } from '../../../dto/subscription/response/subscription.response.dto';

export interface ICancelSubscriptionUsecase {
  execute(userId: string): Promise<SubscriptionResponseDTO>;
}