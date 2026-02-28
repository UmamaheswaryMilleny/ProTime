import type { Response, NextFunction } from 'express';
import type { CustomRequest } from '../../middlewares/auth.middleware';

export interface ITodoController {
  createTodo(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  getTodos(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  updateTodo(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  deleteTodo(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  completeTodo(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  completePomodoro(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}