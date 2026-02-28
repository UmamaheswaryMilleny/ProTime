import { injectable } from 'tsyringe';
import { container } from 'tsyringe';

import { BaseRoute } from '../base-route';
import { asyncHandler } from '../../../shared/asyncHandler';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware';
import { BlockedUserMiddleware } from '../../middlewares/blocked-user.middleware';

import { TodoController } from '../../controllers/todo/todo.controller';

import { CreateTodoRequestDTO } from '../../../application/dto/todo/request/todo.create.request.dto';
import { UpdateTodoRequestDTO } from '../../../application/dto/todo/request/todo.update.request.dto';
import { CompletePomodoroRequestDTO } from '../../../application/dto/todo/request/pomodoro.request.dto';
import { UserRole } from '../../../domain/enums/user.enums';

@injectable()
export class TodoRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const ctrl = container.resolve(TodoController);
    const blockedMiddleware = container.resolve(BlockedUserMiddleware);

    // All todo routes require:
    // 1. verifyAuth       → valid JWT + attaches req.user
    // 2. authorizeRole    → must be CLIENT role
    // 3. checkBlockedUser → DB check that user is not blocked
    this.router.use(verifyAuth);
    this.router.use(authorizeRole([UserRole.CLIENT]));
    this.router.use(
      asyncHandler(blockedMiddleware.checkBlockedUser.bind(blockedMiddleware)),
    );

    // ─── Todo CRUD ────────────────────────────────────────────────────

    // GET /api/v1/todos?filter=all|pending|completed
    this.router.get(
      '/',
      asyncHandler(ctrl.getTodos.bind(ctrl)),
    );

    // POST /api/v1/todos
    this.router.post(
      '/',
      validationMiddleware(CreateTodoRequestDTO),
      asyncHandler(ctrl.createTodo.bind(ctrl)),
    );

    // PUT /api/v1/todos/:todoId
    this.router.put(
      '/:todoId',
      validationMiddleware(UpdateTodoRequestDTO),
      asyncHandler(ctrl.updateTodo.bind(ctrl)),
    );

    // DELETE /api/v1/todos/:todoId
    this.router.delete(
      '/:todoId',
      asyncHandler(ctrl.deleteTodo.bind(ctrl)),
    );

    // ─── Todo Actions ─────────────────────────────────────────────────

    // PATCH /api/v1/todos/:todoId/complete
    // Marks task as done — calculates and locks in XP
    this.router.patch(
      '/:todoId/complete',
      asyncHandler(ctrl.completeTodo.bind(ctrl)),
    );

    // PATCH /api/v1/todos/:todoId/pomodoro/complete
    // Called when pomodoro timer finishes — records time, sets pomodoroCompleted flag
    // Body: { actualPomodoroTime?: number }
    this.router.patch(
      '/:todoId/pomodoro/complete',
      validationMiddleware(CompletePomodoroRequestDTO),
      asyncHandler(ctrl.completePomodoro.bind(ctrl)),
    );
  }
}