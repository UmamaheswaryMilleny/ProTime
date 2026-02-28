import { container } from 'tsyringe';

// Use case implementations
import { RegisterUsecase } from '../../application/usecase/implementation/register.usecase.js';
import { LoginUsecase } from '../../application/usecase/implementation/login.usecase.js';
import { LogoutUseCase } from '../../application/usecase/implementation/logout.usecase.js';
import { VerifyOtpUseCase } from '../../application/usecase/implementation/verify-otp.usecase.js';
import { ResendOtpUseCase } from '../../application/usecase/implementation/resend-otp.usecase.js';
import { RefreshTokenUseCase } from '../../application/usecase/implementation/refresh-token.usecase.js';
import { ForgotPasswordUsecase } from '../../application/usecase/implementation/forgot-password.usecase.js';
import { ResetPasswordUsecase } from '../../application/usecase/implementation/reset-password.usecase.js';
import GoogleAuthUsecase from '../../application/usecase/implementation/google-auth.usecase.js';

// Use case interfaces
import type { IRegisterUsecase } from '../../application/usecase/interface/auth/register.usecase.interface.js';
import type { ILogoutUseCase } from '../../application/usecase/interface/auth/logout.usecase.interface.js';
import type { ILoginUsecase } from '../../application/usecase/interface/auth/login.usecase.interface.js';
import type { IVerifyOtpUsecase } from '../../application/usecase/interface/auth/verify-otp.usecase.interface.js';
import type { ISendOtpUsecase } from '../../application/usecase/interface/auth/send-otp.usecase.interface.js';
import type { IRefreshTokenUsecase } from '../../application/usecase/interface/auth/refresh-token.usecase.interface.js';
import type { IforgotPasswordUseCase } from '../../application/usecase/interface/auth/forgot-password.usecase.interface.js';
import type { IResetPasswordUsecase } from '../../application/usecase/interface/auth/reset-password.usecase.interface.js';
import type { IGoogleAuthUsecase } from '../../application/usecase/interface/auth/google-auth.usecase.interface.js';

import { CreateTodoUsecase } from '../../application/usecase/implementation/todo/todo.create.usecase.js';
import { GetTodosUsecase } from '../../application/usecase/implementation/todo/todos.get.usecase.js';
import { UpdateTodoUsecase } from '../../application/usecase/implementation/todo/todo.update.usecase.js';
import { DeleteTodoUsecase } from '../../application/usecase/implementation/todo/todo.delete.usecase.js';
import { CompleteTodoUsecase } from '../../application/usecase/implementation/todo/todo.complete.usecase.js';
import { CompletePomodoroUsecase } from '../../application/usecase/implementation/todo/pomodoro.complete.usecase.js';

import type { ICreateTodoUsecase } from '../../application/usecase/interface/todo/todo-create.usecase.interface.js';
import type { IGetTodosUsecase } from '../../application/usecase/interface/todo/todos-get.usecase.interface.js';
import type { IUpdateTodoUsecase } from '../../application/usecase/interface/todo/todo-update.usecase.interface.js';
import type { IDeleteTodoUsecase } from '../../application/usecase/interface/todo/todo.delete.usecase.interface.js';
import type { ICompleteTodoUsecase } from '../../application/usecase/interface/todo/todo.complete.usecase.interface.js';
import type { ICompletePomodoroUsecase } from '../../application/usecase/interface/todo/pomodoro-complete.usecase.interface.js';

export class UsecaseRegistry {
  static register(): void {
    // ─── Auth Use Cases ───────────────────────────────────────────────
    container.register<IRegisterUsecase>('IRegisterUsecase', {
      useClass: RegisterUsecase,
    });

    container.register<ILoginUsecase>('ILoginUsecase', {
      useClass: LoginUsecase,
    });

    container.register<ILogoutUseCase>('ILogoutUseCase', {
      useClass: LogoutUseCase,
    });

    container.register<IVerifyOtpUsecase>('IVerifyOtpUsecase', {
      useClass: VerifyOtpUseCase,
    });

    container.register<ISendOtpUsecase>('ISendOtpUsecase', {
      useClass: ResendOtpUseCase,
    });

    container.register<IRefreshTokenUsecase>('IRefreshTokenUsecase', {
      useClass: RefreshTokenUseCase,
    });

    container.register<IforgotPasswordUseCase>('IForgotPasswordUsecase', {
      useClass: ForgotPasswordUsecase,
    });

    container.register<IResetPasswordUsecase>('IResetPasswordUsecase', {
      useClass: ResetPasswordUsecase,
    });

    container.register<IGoogleAuthUsecase>('IGoogleAuthUsecase', {
      useClass: GoogleAuthUsecase,
    });

    // todo
    container.register<ICreateTodoUsecase>('ICreateTodoUsecase', {
      useClass: CreateTodoUsecase,
    });

    container.register<IGetTodosUsecase>('IGetTodosUsecase', {
      useClass: GetTodosUsecase,
    });

    container.register<IUpdateTodoUsecase>('IUpdateTodoUsecase', {
      useClass: UpdateTodoUsecase,
    });

    container.register<IDeleteTodoUsecase>('IDeleteTodoUsecase', {
      useClass: DeleteTodoUsecase,
    });

    container.register<ICompleteTodoUsecase>('ICompleteTodoUsecase', {
      useClass: CompleteTodoUsecase,
    });

    container.register<ICompletePomodoroUsecase>('ICompletePomodoroUsecase', {
      useClass: CompletePomodoroUsecase,
    });
  }
}
