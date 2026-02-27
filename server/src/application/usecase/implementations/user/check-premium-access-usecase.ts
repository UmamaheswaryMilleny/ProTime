import { inject, injectable } from "tsyringe";
import type { ISubscriptionRepository } from "../../../domain/repositoryInterface/subscription/subscription-repository.interface";

@injectable()
export class CheckPremiumAccessUsecase {
  constructor(
    @inject("ISubscriptionRepository")
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(userId: string): Promise<boolean> {
    const sub = await this.subscriptionRepository.getActiveSubscription(userId);
    return !!sub && sub.type === "PREMIUM";
  }
}
