import type { CreateCheckoutSessionRequestDTO } from '../../../dto/subscription/request/create-checkout-session.request.dto';
import type { CheckoutSessionResponseDTO } from '../../../dto/subscription/response/subscription.checkout.session.response.dto';

export interface ICreateCheckoutSessionUsecase {
  execute(
    userId: string,
    dto: CreateCheckoutSessionRequestDTO,
  ): Promise<CheckoutSessionResponseDTO>;
}