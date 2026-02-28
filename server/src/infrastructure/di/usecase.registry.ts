import { container } from 'tsyringe';

// Use case implementations
import { RegisterUsecase } from '../../application/usecase/implementation/register.usecase';
import { LoginUsecase } from '../../application/usecase/implementation/login.usecase';
import { LogoutUseCase } from '../../application/usecase/implementation/logout.usecase';
import { VerifyOtpUseCase } from '../../application/usecase/implementation/verify-otp.usecase';
import { ResendOtpUseCase } from '../../application/usecase/implementation/resend-otp.usecase';
import { RefreshTokenUseCase } from '../../application/usecase/implementation/refresh-token.usecase';
import { ForgotPasswordUsecase } from '../../application/usecase/implementation/forgot-password.usecase';
import { ResetPasswordUsecase } from '../../application/usecase/implementation/reset-password.usecase';
import GoogleAuthUsecase from '../../application/usecase/implementation/google-auth.usecase';

// Use case interfaces
import type { IRegisterUsecase } from '../../application/usecase/interface/auth/register.usecase.interface';
import type { ILogoutUseCase } from '../../application/usecase/interface/auth/logout.usecase.interface';
import type { ILoginUsecase } from '../../application/usecase/interface/auth/login.usecase.interface';
import type { IVerifyOtpUsecase } from '../../application/usecase/interface/auth/verify-otp.usecase.interface';
import type { ISendOtpUsecase } from '../../application/usecase/interface/auth/send-otp.usecase.interface';
import type { IRefreshTokenUsecase } from '../../application/usecase/interface/auth/refresh-token.usecase.interface';
import type { IforgotPasswordUseCase } from '../../application/usecase/interface/auth/forgot-password.usecase.interface';
import type { IResetPasswordUsecase } from '../../application/usecase/interface/auth/reset-password.usecase.interface';
import type { IGoogleAuthUsecase } from '../../application/usecase/interface/auth/google-auth.usecase.interface';

import { CreateTodoUsecase } from '../../application/usecase/implementation/todo/todo.create.usecase';
import { GetTodosUsecase } from '../../application/usecase/implementation/todo/todos.get.usecase';
import { UpdateTodoUsecase } from '../../application/usecase/implementation/todo/todo.update.usecase';
import { DeleteTodoUsecase } from '../../application/usecase/implementation/todo/todo.delete.usecase';
import { CompleteTodoUsecase } from '../../application/usecase/implementation/todo/todo.complete.usecase';
import { CompletePomodoroUsecase } from '../../application/usecase/implementation/todo/pomodoro.complete.usecase';

import type { ICreateTodoUsecase } from '../../application/usecase/interface/todo/todo-create.usecase.interface';
import type { IGetTodosUsecase } from '../../application/usecase/interface/todo/todos-get.usecase.interface';
import type { IUpdateTodoUsecase } from '../../application/usecase/interface/todo/todo-update.usecase.interface';
import type { IDeleteTodoUsecase } from '../../application/usecase/interface/todo/todo.delete.usecase.interface';
import type { ICompleteTodoUsecase } from '../../application/usecase/interface/todo/todo.complete.usecase.interface';
import type { ICompletePomodoroUsecase } from '../../application/usecase/interface/todo/pomodoro-complete.usecase.interface';

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
