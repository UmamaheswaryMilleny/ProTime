import { Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import type { ICommunityChatController } from '../../interfaces/community-chat/community.controller.interface';
import type { ISendMessageUsecase } from '../../../application/usecase/interface/community-chat/send-message.usecase.interface';
import type { IGetMessagesUsecase } from '../../../application/usecase/interface/community-chat/get-messages.usecase.interface';
import { SendMessageRequestDTO } from '../../../application/dto/community-chat/request/send-message.request.dto';
import { GetMessagesRequestDTO } from '../../../application/dto/community-chat/request/get-messages.request.dto';
import { HTTP_STATUS } from '../../../shared/constants/constants';
import type { CustomRequest } from '../../middlewares/auth.middleware';

@injectable()
export class CommunityChatController implements ICommunityChatController {
  constructor(
    @inject('ISendMessageUsecase')
    private readonly sendMessageUsecase: ISendMessageUsecase,
    @inject('IGetMessagesUsecase')
    private readonly getMessagesUsecase: IGetMessagesUsecase,
  ) {}

  async sendMessage(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const userId = req.user.id as string;
      const dto = req.body as SendMessageRequestDTO;
      const result = await this.sendMessageUsecase.execute(userId, dto);
      
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Message sent successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate and parse query parameters mapping to GetMessagesRequestDTO
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const before = req.query.before as string | undefined;

      const dto: GetMessagesRequestDTO = {
        limit: limit > 50 ? 50 : limit, // Enforce max limit like DTO validation
        before,
      };

      const result = await this.getMessagesUsecase.execute(req.user?.id as string | undefined, dto);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Messages fetched successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
