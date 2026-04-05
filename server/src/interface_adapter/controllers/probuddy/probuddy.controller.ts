import { Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IChatWithAiUsecase } from '../../../application/usecase/interface/probuddy/chat-with-ai.usecase.interface';
import { HTTP_STATUS } from '../../../shared/constants/constants';
import type { CustomRequest } from '../../middlewares/auth.middleware';

@injectable()
export class ProBuddyController {
  constructor(
    @inject('IChatWithAiUsecase')
    private chatWithAiUsecase: IChatWithAiUsecase
  ) {}

  async chat(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { prompt } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
        return;
      }

      if (!prompt) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Prompt is required' });
        return;
      }

      const response = await this.chatWithAiUsecase.execute(userId, prompt);
      res.status(HTTP_STATUS.OK).json({ success: true, response });
    } catch (error: any) {
      console.error('ProBuddy Controller Error:', error.message);
      
      const isLimitError = error.message.toLowerCase().includes('limit reached');
      const statusCode = isLimitError ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const message = isLimitError 
        ? error.message 
        : "ProBuddy is temporarily overwhelmed by your brilliance. Please try again in a few moments!";

      res.status(statusCode).json({ success: false, message });
    }
  }
}
