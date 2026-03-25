// src/interface_adapter/interfaces/calendar/chat-session.controller.interface.ts

import type { Response, NextFunction } from 'express';
import type { CustomRequest } from '../../middlewares/auth.middleware';

export interface IChatSessionController {
  startSession(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  endSession(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  proposeNextSession(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  proposeRecurringSession(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  respondToScheduleRequest(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  saveSessionNotes(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}