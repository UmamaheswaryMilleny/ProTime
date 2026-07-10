import { PlanModel } from '../models/plan.model';
import { logger } from '../../config/logger.config';

export const seedDefaultPlans = async (): Promise<void> => {
  try {
    const count = await PlanModel.countDocuments();
    if (count > 0) {
      return;
    }

    const defaultPlans = [
      {
        name: 'Free Plan',
        code: 'FREE',
        price: 0,
        features: [
          'Unlimited Todos & Pomodoro',
          '5 Buddy Matches per month',
          '3 Group Room joins per month',
          '10 Community Chats per day',
          'Level Cap: Level 6 (Learner)',
          '30 AI Tokens per month',
          'View Monthly Reports',
        ],
        isActive: true,
      },
      {
        name: 'Premium Plan',
        code: 'PREMIUM',
        price: 499,
        features: [
          'Everything in Free Plan',
          'Unlimited Buddy Matches & Rooms',
          'Create your own Study Rooms',
          'Unlimited Community Chat',
          'Level Cap: Level 20 (Master)',
          '100 AI Tokens per day',
          'Download Monthly Reports',
          'Premium Badges & Advanced Filters',
          'Bonus Streak XP Rewards',
        ],
        isActive: true,
      },
    ];

    await PlanModel.insertMany(defaultPlans);
    logger.info('✅ Default subscription plans seeded successfully');
  } catch (error: any) {
    logger.error('❌ Error seeding default subscription plans:', {
      message: error.message,
      stack: error.stack,
    });
  }
};
