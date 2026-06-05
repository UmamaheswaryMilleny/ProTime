import cron from 'node-cron';
import { UserModel } from '../database/models/user.model';
import { logger } from '../config/logger.config';

/**
 * startUnblockExpiredBlocksCron
 * Runs every hour — finds users who have a temporary block that has expired
 * (isBlocked: true AND blockedUntil <= now) and unblocks them automatically.
 */
export const startUnblockExpiredBlocksCron = (): void => {
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();

      const result = await UserModel.updateMany(
        {
          isBlocked: true,
          blockedUntil: { $ne: null, $lte: now },
        },
        {
          $set: { isBlocked: false, blockedUntil: null, updatedAt: now },
        },
      );

      if (result.modifiedCount > 0) {
        logger.info(
          `[Cron] Auto-unblocked ${result.modifiedCount} user(s) whose temporary block expired.`,
        );
      }
    } catch (err) {
      logger.error('[Cron] unblock-expired-blocks error:', { error: err });
    }
  });

  logger.info('[Cron] unblock-expired-blocks scheduled (every hour).');
};
