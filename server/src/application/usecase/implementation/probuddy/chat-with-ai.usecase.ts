import { inject, injectable } from 'tsyringe';
import { IChatWithAiUsecase } from '../../interface/probuddy/chat-with-ai.usecase.interface';
import type { IAIService } from '../../../service_interface/ai-service.interface';
import type { ISubscriptionRepository } from '../../../../domain/repositories/subscription/subscription.repository.interface';
import { SubscriptionPlan } from '../../../../domain/enums/subscription.enums';

@injectable()
export class ChatWithAiUsecase implements IChatWithAiUsecase {
  constructor(
    @inject('ISubscriptionRepository')
    private subscriptionRepository: ISubscriptionRepository,
    @inject('IAIService')
    private aiService: IAIService
  ) {}

  async execute(userId: string, prompt: string): Promise<string> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    
    if (!subscription) {
      throw new Error('Subscription not found for user');
    }

    const now = new Date();
    const lastReset = new Date(subscription.lastAiUsageReset);
    const diffInHours = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    let currentUsage = subscription.aiUsageCount;

    // Reset counter if more than 24 hours have passed
    if (diffInHours >= 24) {
      currentUsage = 0;
      await this.subscriptionRepository.updateByUserId(userId, {
        aiUsageCount: 0,
        lastAiUsageReset: now,
      });
    }

    // Enforce daily limits: 20 for Free, 100 for Premium
    const limit = subscription.plan === SubscriptionPlan.PREMIUM ? 100 : 20;

    if (currentUsage >= limit) {
      throw new Error(`Daily AI limit reached (${limit} messages). Upgrade or wait until tomorrow!`);
    }

    // Call AI Service
    const aiResponse = await this.aiService.generateResponse(prompt);

    // Increment usage
    await this.subscriptionRepository.updateByUserId(userId, {
      aiUsageCount: currentUsage + 1,
    });

    return aiResponse;
  }
}
