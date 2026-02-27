import type { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';

import type { IUserRepository } from '../../../domain/repositories/user/user.repository.interface.js';
import { UserMapper } from '../../../application/mapper/user.mapper.js';
import { ResponseHelper } from '../../helpers/response.helper.js';
import { HTTP_STATUS } from '../../../shared/constants/constants.js';

@injectable()
export class AdminController {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  // ─── Get All Users ────────────────────────────────────────────────────────

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;
      const sort = (req.query.sort as string) || 'createdAt';

      // Map raw query string to enum values
      const rawStatus = req.query.status as string | undefined;
      const status: 'all' | 'blocked' | 'unblocked' =
        rawStatus === 'blocked'
          ? 'blocked'
          : rawStatus === 'unblocked'
          ? 'unblocked'
          : 'all';

      const rawOrder = req.query.order as string | undefined;
      const order: 'asc' | 'desc' = rawOrder === 'desc' ? 'desc' : 'asc';

      const { users, total } = await this.userRepository.findAllWithSearch(
        page,
        limit,
        search,
        status,
        sort,
        order
      );

      // Use UserMapper to build paginated response
      const result = UserMapper.toPaginatedResponse(users, { total, page, limit });

      ResponseHelper.success(
        res,
        HTTP_STATUS.OK,
        'Users retrieved successfully',
        result
      );
    } catch (error) {
      next(error);
    }
  }

  // ─── Block User ───────────────────────────────────────────────────────────

async blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;  // ✅

    await this.userRepository.updateBlockStatus(userId, true);

    ResponseHelper.success(res, HTTP_STATUS.OK, 'User blocked successfully');
  } catch (error) {
    next(error);
  }
}

async unblockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;  // ✅

    await this.userRepository.updateBlockStatus(userId, false);

    ResponseHelper.success(res, HTTP_STATUS.OK, 'User unblocked successfully');
  } catch (error) {
    next(error);
  }
}
}