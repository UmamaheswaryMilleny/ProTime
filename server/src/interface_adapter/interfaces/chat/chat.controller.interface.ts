import type { Response, NextFunction } from 'express';
import type { CustomRequest } from '../../middlewares/auth.middleware';

export interface IChatController {
    getConversations(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    getMessages(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    sendMessage(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    markAsRead(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    startSession(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    endSession(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    uploadAttachment(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
    deleteChat(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}