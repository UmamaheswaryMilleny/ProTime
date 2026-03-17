import type { Request, Response, NextFunction } from 'express';

export interface ICommunityChatController {
  sendMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
  getMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
}
