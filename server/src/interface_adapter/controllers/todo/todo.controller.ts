import type { Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';

import type { ITodoController } from '../../interfaces/todo/todo.controller.interface.js';
import type { ICreateTodoUsecase } from '../../../application/usecase/interface/todo/todo-create.usecase.interface.js';
import type { IGetTodosUsecase } from '../../../application/usecase/interface/todo/todos-get.usecase.interface.js';
import type { IUpdateTodoUsecase } from '../../../application/usecase/interface/todo/todo-update.usecase.interface.js';
import type { IDeleteTodoUsecase } from '../../../application/usecase/interface/todo/todo.delete.usecase.interface.js';
import type { ICompleteTodoUsecase } from '../../../application/usecase/interface/todo/todo.complete.usecase.interface.js';
import type { ICompletePomodoroUsecase } from '../../../application/usecase/interface/todo/pomodoro-complete.usecase.interface.js';

import type { CustomRequest } from '../../middlewares/auth.middleware.js';
import { ResponseHelper } from '../../helpers/response.helper.js';
import { HTTP_STATUS, SUCCESS_MESSAGE } from '../../../shared/constants/constants.js';

@injectable()
export class TodoController implements ITodoController {
  constructor(
    @inject('ICreateTodoUsecase')
    private readonly createTodoUsecase: ICreateTodoUsecase,

    @inject('IGetTodosUsecase')
    private readonly getTodosUsecase: IGetTodosUsecase,

    @inject('IUpdateTodoUsecase')
    private readonly updateTodoUsecase: IUpdateTodoUsecase,

    @inject('IDeleteTodoUsecase')
    private readonly deleteTodoUsecase: IDeleteTodoUsecase,

    @inject('ICompleteTodoUsecase')
    private readonly completeTodoUsecase: ICompleteTodoUsecase,

    @inject('ICompletePomodoroUsecase')
    private readonly completePomodoroUsecase: ICompletePomodoroUsecase,
  ) {}

  // ─── Create Todo ──────────────────────────────────────────────────────────

  async createTodo(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseHelper.error(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      const todo = await this.createTodoUsecase.execute(req.user.id, req.body);

      ResponseHelper.success(res, HTTP_STATUS.CREATED, SUCCESS_MESSAGE.TODO.CREATED, todo);
    } catch (error) {
      next(error);
    }
  }

  // ─── Get Todos ────────────────────────────────────────────────────────────

  async getTodos(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseHelper.error(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      const rawFilter = req.query.filter;
      const filter: 'all' | 'pending' | 'completed' =
        rawFilter === 'pending'
          ? 'pending'
          : rawFilter === 'completed'
            ? 'completed'
            : 'all';

      const result = await this.getTodosUsecase.execute(req.user.id, filter);

      ResponseHelper.success(res, HTTP_STATUS.OK, SUCCESS_MESSAGE.TODO.FETCHED, result);
    } catch (error) {
      next(error);
    }
  }

  // ─── Update Todo ──────────────────────────────────────────────────────────

  async updateTodo(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseHelper.error(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      const todoId = req.params.todoId as string;

      const todo = await this.updateTodoUsecase.execute(req.user.id, todoId, req.body);

      ResponseHelper.success(res, HTTP_STATUS.OK, SUCCESS_MESSAGE.TODO.UPDATED, todo);
    } catch (error) {
      next(error);
    }
  }

  // ─── Delete Todo ──────────────────────────────────────────────────────────

  async deleteTodo(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseHelper.error(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      const todoId = req.params.todoId as string;

      await this.deleteTodoUsecase.execute(req.user.id, todoId);

      ResponseHelper.success(res, HTTP_STATUS.OK, SUCCESS_MESSAGE.TODO.DELETED);
    } catch (error) {
      next(error);
    }
  }

  // ─── Complete Todo ────────────────────────────────────────────────────────

  async completeTodo(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseHelper.error(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      const todoId = req.params.todoId as string;

      const todo = await this.completeTodoUsecase.execute(req.user.id, todoId);

      ResponseHelper.success(res, HTTP_STATUS.OK, SUCCESS_MESSAGE.TODO.COMPLETED, todo);
    } catch (error) {
      next(error);
    }
  }

  // ─── Complete Pomodoro ────────────────────────────────────────────────────

  async completePomodoro(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ResponseHelper.error(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        return;
      }

      const todoId = req.params.todoId as string;
      const { actualPomodoroTime } = req.body;

      const todo = await this.completePomodoroUsecase.execute(
        req.user.id,
        todoId,
        actualPomodoroTime,
      );

      ResponseHelper.success(res, HTTP_STATUS.OK, SUCCESS_MESSAGE.TODO.POMODORO_COMPLETED, todo);
    } catch (error) {
      next(error);
    }
  }
}