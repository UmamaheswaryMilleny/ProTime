import { inject, injectable } from 'tsyringe';
import { IChatWithAiUsecase } from '../../interface/probuddy/chat-with-ai.usecase.interface';
import type { IAIService } from '../../../service_interface/ai-service.interface';
import type { ISubscriptionRepository } from '../../../../domain/repositories/subscription/subscription.repository.interface';
import { SubscriptionPlan } from '../../../../domain/enums/subscription.enums';
import type { INotificationService } from '../../../service_interface/notification-service.interface';
import { NotificationType } from '../../../service_interface/notification-service.interface';
import { FREE_MONTHLY_AI_TOKENS, PREMIUM_DAILY_AI_TOKENS } from '../../../../shared/constants/constants';

@injectable()
export class ChatWithAiUsecase implements IChatWithAiUsecase {
  constructor(
    @inject('ISubscriptionRepository')
    private subscriptionRepository: ISubscriptionRepository,
    @inject('IAIService')
    private aiService: IAIService,
    @inject('INotificationService')
    private notificationService: INotificationService
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

    // Enforce limits: 30/month for Free, 100/day for Premium (atomic — race-condition safe)
    const isPremium = subscription.plan === SubscriptionPlan.PREMIUM;
    const limit = isPremium ? PREMIUM_DAILY_AI_TOKENS : FREE_MONTHLY_AI_TOKENS;

    const updated = await this.subscriptionRepository.atomicIncrementAiUsage(userId, limit);

    if (!updated) {
      // Limit already reached — the atomic update was rejected by MongoDB
      const upgradeMsg = isPremium
        ? 'Daily Premium AI limit reached. Please wait until tomorrow!'
        : 'Monthly Free AI limit reached (30 messages). Upgrade to Premium for 100 daily messages!';

      try {
        this.notificationService.notifyUser(userId, {
          type: NotificationType.ADMIN_WARNING,
          title: 'AI Limit Reached',
          message: upgradeMsg,
        });
      } catch {
        // Ignore notification delivery failures
      }

      throw new Error(upgradeMsg);
    }

    // Call AI Service — if it fails, roll back the token increment
    try {
      return await this.aiService.generateResponse(prompt);
    } catch {
      // AI call failed — give the token back so the user isn't penalised
      try {
        await this.subscriptionRepository.decrementAiUsage(userId);
      } catch (rollbackErr) {
        console.error('Failed to roll back AI usage token:', rollbackErr);
      }
      throw new Error('AI service is temporarily unavailable. Your token has not been consumed — please try again.');
    }
  }
}
