import type { Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';

import type { IUserRepository } from '../../domain/repositories/user/user.repository.interface';
import { UserRole } from '../../domain/enums/user.enums';
import { HTTP_STATUS, ERROR_MESSAGE } from '../../shared/constants/constants';
import type { CustomRequest } from './auth.middleware';

@injectable()
export class BlockedUserMiddleware {
  constructor(
    @inject('IUserRepository')
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * checkBlockedUser — fetches user from DB and verifies they are not blocked.
   * For temporary blocks: if blockedUntil has passed, auto-unblocks and lets through.
   * Must be used AFTER verifyAuth (requires req.user).
   * Admins are never blocked — skip check for ADMIN role.
   */
  async checkBlockedUser(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGE.AUTHENTICATION.UNAUTHORIZED_ACCESS,
        });
        return;
      }

      const { id, role } = req.user;

      // Admins are never blocked — skip DB check entirely
      if (role === UserRole.ADMIN) {
        next();
        return;
      }

      const user = await this.userRepository.findById(id);

      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGE.AUTHENTICATION.USER_NOT_FOUND,
        });
        return;
      }

      if (user.isDeleted) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: ERROR_MESSAGE.AUTHENTICATION.UNAUTHORIZED_ACCESS,
        });
        return;
      }

      if (user.isBlocked) {
        // If this is a temporary block that has already expired, auto-unblock
        if (user.blockedUntil && new Date() >= user.blockedUntil) {
          await this.userRepository.updateBlockStatus(id, false); // clears blockedUntil too
          next();
          return;
        }

        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: ERROR_MESSAGE.AUTHENTICATION.USER_BLOCKED,
        });
        return;
      }

      next();
    } catch (error: unknown) {
      next(error);
    }
  }
}