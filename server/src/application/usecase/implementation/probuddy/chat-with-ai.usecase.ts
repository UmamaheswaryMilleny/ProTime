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
    let subscription = await this.subscriptionRepository.findByUserId(userId);
    
    // Auto-provision FREE subscription if missing (prevents 500 error for older users)
    if (!subscription) {
      subscription = await this.subscriptionRepository.updateByUserId(userId, {
        plan: SubscriptionPlan.FREE,
        aiUsageCount: 0,
        lastAiUsageReset: new Date(),
      });
      
      if (!subscription) throw new Error('Failed to initialize subscription for user');
    }

    const now = new Date();
    // Default to a safe date if lastAiUsageReset is somehow invalid/null
    const lastReset = subscription.lastAiUsageReset ? new Date(subscription.lastAiUsageReset) : new Date(0);
    const diffInHours = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    let currentUsage = subscription.aiUsageCount || 0;

    // Reset counter if more than 24 hours have passed
    if (diffInHours >= 24 || isNaN(diffInHours)) {
      currentUsage = 0;
      await this.subscriptionRepository.updateByUserId(userId, {
        aiUsageCount: 0,
        lastAiUsageReset: now,
      });
    }

    // Enforce daily limits: 20 for Free, 100 for Premium
    const isPremium = subscription.plan === SubscriptionPlan.PREMIUM;
    const limit = isPremium ? 100 : 20;

    if (currentUsage >= limit) {
      const upgradeMsg = isPremium 
        ? "Daily Premium AI limit reached. Please wait until tomorrow!" 
        : "Daily Free AI limit reached (20 messages). Upgrade to Premium for 100 daily messages!";
      throw new Error(upgradeMsg);
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
