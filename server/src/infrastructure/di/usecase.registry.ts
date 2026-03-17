import { container } from 'tsyringe';

// Use case implementations
import { RegisterUsecase } from '../../application/usecase/implementation/auth/register.usecase';
import { LoginUsecase } from '../../application/usecase/implementation/auth/login.usecase';
import { LogoutUseCase } from '../../application/usecase/implementation/auth/logout.usecase';
import { VerifyOtpUseCase } from '../../application/usecase/implementation/auth/verify-otp.usecase';
import { ResendOtpUseCase } from '../../application/usecase/implementation/auth/resend-otp.usecase';
import { RefreshTokenUseCase } from '../../application/usecase/implementation/auth/refresh-token.usecase';
import { ForgotPasswordUsecase } from '../../application/usecase/implementation/auth/forgot-password.usecase';
import { ResetPasswordUsecase } from '../../application/usecase/implementation/auth/reset-password.usecase';
import GoogleAuthUsecase from '../../application/usecase/implementation/auth/google-auth.usecase';

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

//todo
import type { ICreateTodoUsecase } from '../../application/usecase/interface/todo/todo-create.usecase.interface';
import type { IGetTodosUsecase } from '../../application/usecase/interface/todo/todos-get.usecase.interface';
import type { IUpdateTodoUsecase } from '../../application/usecase/interface/todo/todo-update.usecase.interface';
import type { IDeleteTodoUsecase } from '../../application/usecase/interface/todo/todo.delete.usecase.interface';
import type { ICompleteTodoUsecase } from '../../application/usecase/interface/todo/todo.complete.usecase.interface';
import type { ICompletePomodoroUsecase } from '../../application/usecase/interface/todo/pomodoro-complete.usecase.interface';

//profile-upload
import { UploadProfileImageUsecase } from '../../application/usecase/implementation/user/image.usecase';
import type { IUploadProfileImageUsecase } from '../../application/usecase/interface/user/image.usecase.interface';

//gamification
import { AwardXpUsecase } from '../../application/usecase/implementation/gamification/xp.usecase';
import { UpdateStreakUsecase } from '../../application/usecase/implementation/gamification/streak.update.usecase';
import { CheckAndAwardBadgesUsecase } from '../../application/usecase/implementation/gamification/badges.award.usecase';
import { IInitializeGamificationUsecase } from '../../application/usecase/interface/gamification/initialize.usecase.interface';
import { IGetGamificationUsecase } from '../../application/usecase/interface/gamification/get-gamification.usecase.interface';
import { IAwardXpUsecase } from '../../application/usecase/interface/gamification/award-xp.usecase.interface';
import { IUpdateStreakUsecase } from '../../application/usecase/interface/gamification/update.streak.usecase.interface';
import { ICheckAndAwardBadgesUsecase } from '../../application/usecase/interface/gamification/check-and-award-badges.usecase.interface';
import { InitializeGamificationUsecase } from '../../application/usecase/implementation/gamification/gamification.initialize.usecase';
import { GetGamificationUsecase } from '../../application/usecase/implementation/gamification/gamification.get.usecase';

//subscription

// ─── Subscription ─────────────────────────────────────────────────────────────
import { GetSubscriptionUsecase } from '../../application/usecase/implementation/subscription/get-subscription.usecase';
import { CreateCheckoutSessionUsecase } from '../../application/usecase/implementation/subscription/create-checkout-session.usecase';
import { CancelSubscriptionUsecase } from '../../application/usecase/implementation/subscription/cancel-subscription.usecase';
import { HandleStripeWebhookUsecase } from '../../application/usecase/implementation/subscription/handle-stripe-webhook.usecase';
import type { IGetSubscriptionUsecase } from '../../application/usecase/interface/subscription/get-subscription.usecase.interface';
import type { ICreateCheckoutSessionUsecase } from '../../application/usecase/interface/subscription/create-checkout-session.usecase.interface';
import type { ICancelSubscriptionUsecase } from '../../application/usecase/interface/subscription/cancel-subscription.usecase.interface';
import type { IHandleStripeWebhookUsecase } from '../../application/usecase/interface/subscription/handle-stripe-webhook.usecase.interface';

//buddy match

import { SaveBuddyPreferenceUsecase } from '../../application/usecase/implementation/buddy-match/save-buddy-preference.usecase';
import { GetBuddyPreferenceUsecase } from '../../application/usecase/implementation/buddy-match/get-buddy-preference.usecase';
import { FindBuddyMatchesUsecase } from '../../application/usecase/implementation/buddy-match/find-buddy-matches.usecase';
import { SendBuddyRequestUsecase } from '../../application/usecase/implementation/buddy-match/send-buddy-request.usecase';
import { RespondToBuddyRequestUsecase } from '../../application/usecase/implementation/buddy-match/respond-to-buddy-request.usecase';
import { GetBuddyListUsecase } from '../../application/usecase/implementation/buddy-match/get-buddy-list.usecase';
import { GetPendingRequestsUsecase } from '../../application/usecase/implementation/buddy-match/get-pending-requests.usecase';
import { GetSentRequestsUsecase } from '../../application/usecase/implementation/buddy-match/get-sent-requests.usecase';
import { BlockBuddyUsecase } from '../../application/usecase/implementation/buddy-match/block-buddy.usecase';
import { UnblockBuddyUsecase } from '../../application/usecase/implementation/buddy-match/unblock-buddy.usecase';
import { GetBlockedUsersUsecase } from '../../application/usecase/implementation/buddy-match/get-blocked-users.usecase';

import type { ISaveBuddyPreferenceUsecase } from '../../application/usecase/interface/buddy-match/save-buddy-preference.usecase.interface';
import type { IGetBuddyPreferenceUsecase } from '../../application/usecase/interface/buddy-match/get-buddy-preference.usecase.interface';
import type { IFindBuddyMatchesUsecase } from '../../application/usecase/interface/buddy-match/find-buddy-matches.usecase.interface';
import type { ISendBuddyRequestUsecase } from '../../application/usecase/interface/buddy-match/send-buddy-request.usecase.interface';
import type { IRespondToBuddyRequestUsecase } from '../../application/usecase/interface/buddy-match/respond-to-buddy-request.usecase.interface';
import type { IGetBuddyListUsecase } from '../../application/usecase/interface/buddy-match/get-buddy-list.usecase.interface';
import type { IGetPendingRequestsUsecase } from '../../application/usecase/interface/buddy-match/get-pending-requests.usecase.interface';
import type { IGetSentRequestsUsecase } from '../../application/usecase/interface/buddy-match/get-sent-requests.usecase.interface';
import type { IBlockBuddyUsecase } from '../../application/usecase/interface/buddy-match/block-buddy.usecase.interface';
import type { IUnblockBuddyUsecase } from '../../application/usecase/interface/buddy-match/unblock-buddy.usecase.interface';
import type { IGetBlockedUsersUsecase } from '../../application/usecase/interface/buddy-match/get-blocked-users.usecase.interface';

import { IGetLocationUsecase } from '../../application/usecase/interface/utility/get-location.usecase.interface';
import { GetLocationUsecase } from '../../application/usecase/implementation/utility/get-location.usecase';

// community
import { GetMessagesUsecase } from '../../application/usecase/implementation/community-chat/get-messages.usecase';
import { SendMessageUsecase } from '../../application/usecase/implementation/community-chat/send-message.usecase';
import type { IGetMessagesUsecase } from '../../application/usecase/interface/community-chat/get-messages.usecase.interface';
import type { ISendMessageUsecase } from '../../application/usecase/interface/community-chat/send-message.usecase.interface'





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

    container.register<IUploadProfileImageUsecase>(
      'IUploadProfileImageUsecase',
      {
        useClass: UploadProfileImageUsecase,
      },
    );

    //gamification
    container.register<IInitializeGamificationUsecase>(
      'IInitializeGamificationUsecase',
      {
        useClass: InitializeGamificationUsecase,
      },
    );
    container.register<IGetGamificationUsecase>('IGetGamificationUsecase', {
      useClass: GetGamificationUsecase,
    });
    container.register<IAwardXpUsecase>('IAwardXpUsecase', {
      useClass: AwardXpUsecase,
    });
    container.register<IUpdateStreakUsecase>('IUpdateStreakUsecase', {
      useClass: UpdateStreakUsecase,
    });
    container.register<ICheckAndAwardBadgesUsecase>(
      'ICheckAndAwardBadgesUsecase',
      {
        useClass: CheckAndAwardBadgesUsecase,
      },
    );


    //subscription
    // ─── Subscription ─────────────────────────────────────────────────────────────
    container.register<IGetSubscriptionUsecase>('IGetSubscriptionUsecase', {
      useClass: GetSubscriptionUsecase,
    });

    container.register<ICreateCheckoutSessionUsecase>(
      'ICreateCheckoutSessionUsecase',
      {
        useClass: CreateCheckoutSessionUsecase,
      },
    );

    container.register<ICancelSubscriptionUsecase>(
      'ICancelSubscriptionUsecase',
      {
        useClass: CancelSubscriptionUsecase,
      },
    );

    container.register<IHandleStripeWebhookUsecase>(
      'IHandleStripeWebhookUsecase',
      {
        useClass: HandleStripeWebhookUsecase,
      },
    );

    //buddy match
    container.register<ISaveBuddyPreferenceUsecase>('ISaveBuddyPreferenceUsecase', { useClass: SaveBuddyPreferenceUsecase });
    container.register<IGetBuddyPreferenceUsecase>('IGetBuddyPreferenceUsecase', { useClass: GetBuddyPreferenceUsecase });
    container.register<IFindBuddyMatchesUsecase>('IFindBuddyMatchesUsecase', { useClass: FindBuddyMatchesUsecase });
    container.register<ISendBuddyRequestUsecase>('ISendBuddyRequestUsecase', { useClass: SendBuddyRequestUsecase });
    container.register<IRespondToBuddyRequestUsecase>('IRespondToBuddyRequestUsecase', { useClass: RespondToBuddyRequestUsecase });
    container.register<IGetBuddyListUsecase>('IGetBuddyListUsecase', { useClass: GetBuddyListUsecase });
    container.register<IGetPendingRequestsUsecase>('IGetPendingRequestsUsecase', { useClass: GetPendingRequestsUsecase });
    container.register<IGetSentRequestsUsecase>('IGetSentRequestsUsecase', { useClass: GetSentRequestsUsecase });
    container.register<IBlockBuddyUsecase>('IBlockBuddyUsecase', { useClass: BlockBuddyUsecase });
    container.register<IUnblockBuddyUsecase>('IUnblockBuddyUsecase', { useClass: UnblockBuddyUsecase });
    container.register<IGetBlockedUsersUsecase>('IGetBlockedUsersUsecase', { useClass: GetBlockedUsersUsecase });

    // utility
    container.register<IGetLocationUsecase>('IGetLocationUsecase', { useClass: GetLocationUsecase });

    // community
    container.register<IGetMessagesUsecase>('IGetMessagesUsecase', { useClass: GetMessagesUsecase });
    container.register<ISendMessageUsecase>('ISendMessageUsecase', { useClass: SendMessageUsecase });
  }
}
