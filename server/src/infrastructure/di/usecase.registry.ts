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
import { PausePomodoroUsecase } from '../../application/usecase/implementation/todo/pomodoro.pause.usecase';
import { ResumePomodoroUsecase } from '../../application/usecase/implementation/todo/pomodoro.resume.usecase';
import { ExpireTodosUsecase } from '../../application/usecase/implementation/todo/expire-todos.usecase';

//todo
import type { ICreateTodoUsecase } from '../../application/usecase/interface/todo/todo-create.usecase.interface';
import type { IGetTodosUsecase } from '../../application/usecase/interface/todo/todos-get.usecase.interface';
import type { IUpdateTodoUsecase } from '../../application/usecase/interface/todo/todo-update.usecase.interface';
import type { IDeleteTodoUsecase } from '../../application/usecase/interface/todo/todo.delete.usecase.interface';
import type { ICompleteTodoUsecase } from '../../application/usecase/interface/todo/todo.complete.usecase.interface';
import type { ICompletePomodoroUsecase } from '../../application/usecase/interface/todo/pomodoro-complete.usecase.interface';
import type { IPausePomodoroUsecase } from '../../application/usecase/interface/todo/pomodoro-pause.usecase.interface';
import type { IResumePomodoroUsecase } from '../../application/usecase/interface/todo/pomodoro-resume.usecase.interface';
import type { IExpireTodosUsecase } from '../../application/usecase/interface/todo/expire-todos.usecase.interface';

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
import { GetMessagesUsecase as CommunityGetMessagesUsecase } from '../../application/usecase/implementation/community-chat/get-messages.usecase';
import { SendMessageUsecase } from '../../application/usecase/implementation/community-chat/send-message.usecase';
import type { IGetMessagesUsecase as ICommunityGetMessagesUsecase } from '../../application/usecase/interface/community-chat/get-messages.usecase.interface';
import type { ISendMessageUsecase } from '../../application/usecase/interface/community-chat/send-message.usecase.interface'

//chat
import { GetConversationsUsecase } from '../../application/usecase/implementation/chat/get-conversations.usecase';
import { GetMessagesUsecase as ChatGetMessagesUsecase } from '../../application/usecase/implementation/chat/get-messages.usecase';
import { SendDirectMessageUsecase } from '../../application/usecase/implementation/chat/send-direct-message.usecase';
import { MarkAsReadUsecase } from '../../application/usecase/implementation/chat/mark-as-read.usecase';
import { StartChatSessionUsecase } from '../../application/usecase/implementation/chat/start-chat-session.usecase';
import { EndChatSessionUsecase } from '../../application/usecase/implementation/chat/end-chat-session.usecase';
import { DeleteChatUsecase } from '../../application/usecase/implementation/chat/delete-chat.usecase';
import type { IGetConversationsUsecase } from '../../application/usecase/interface/chat/get-conversations.usecase.interface';
import type { IGetMessagesUsecase} from '../../application/usecase/interface/chat/get-messages.usecase.interface';
import type { ISendDirectMessageUsecase } from '../../application/usecase/interface/chat/send-direct-message.usecase.interface';
import type { IMarkAsReadUsecase } from '../../application/usecase/interface/chat/mark-as-read.usecase.interface';
import type { IStartChatSessionUsecase } from '../../application/usecase/interface/chat/start-chat-session.usecase.interface';
import type { IEndChatSessionUsecase } from '../../application/usecase/interface/chat/end-chat-session.usecase.interface';
import type { IDeleteChatUsecase } from '../../application/usecase/implementation/chat/delete-chat.usecase';


//report
import { SubmitReportUsecase }    from '../../application/usecase/implementation/report/submit-report.usecase';
import { ResolveReportUsecase }   from '../../application/usecase/implementation/report/resolve-report.usecase';
import { GetReportsUsecase }      from '../../application/usecase/implementation/report/get-reports.usecase';
import { GetReportByIdUsecase }   from '../../application/usecase/implementation/report/get-report-by-id.usecase';
import type { ISubmitReportUsecase }    from '../../application/usecase/interface/report/submit-report.usecase.interface';
import type { IResolveReportUsecase }   from '../../application/usecase/interface/report/resolve-report.usecase.interface';
import type { IGetReportsUsecase }      from '../../application/usecase/interface/report/get-reports.usecase.interface';
import type { IGetReportByIdUsecase }   from '../../application/usecase/interface/report/get-report-by-id.usecase.interface';

//calender

import type { IStartSessionUsecase }                from '../../application/usecase/interface/calendar/start-session.usecase.interface';
import type { IEndSessionUsecase }                  from '../../application/usecase/interface/calendar/end-session.usecase.interface';
import type { ISaveSessionNotesUsecase }            from '../../application/usecase/interface/calendar/save-session-notes.usecase.interface';
import type { IProposeNextSessionUsecase }          from '../../application/usecase/interface/calendar/propose-next-session.usecase.interface';
import type { IProposeRecurringSessionUsecase }     from '../../application/usecase/interface/calendar/propose-recurring-session.usecase.interface';
import type { IRespondToScheduleRequestUsecase }    from '../../application/usecase/interface/calendar/respond-to-schedule-request.usecase.interface';
import type { IGetCalendarEventsUsecase }           from '../../application/usecase/interface/calendar/get-calendar-events.usecase.interface';
import type { IGetDayDetailUsecase }               from '../../application/usecase/interface/calendar/get-day-detail.usecase.interface';
import type { IMarkMissedSessionsUsecase }         from '../../application/usecase/interface/calendar/mark-missed-sessions.usecase.interface';
import type { IExpireScheduleRequestsUsecase }     from '../../application/usecase/interface/calendar/expire-schedule-requests.usecase.interface';
import type { IGetPendingScheduleRequestsUsecase } from '../../application/usecase/interface/calendar/get-pending-schedule-requests.usecase.interface';
import { StartSessionUsecase } from '../../application/usecase/implementation/calendar/start-session.usecase';
import { EndSessionUsecase } from '../../application/usecase/implementation/calendar/end-session.usecase';
import { SaveSessionNotesUsecase } from '../../application/usecase/implementation/calendar/save-session-notes.usecase';
import { ProposeNextSessionUsecase } from '../../application/usecase/implementation/calendar/propose-next-session.usecase';
import { RespondToScheduleRequestUsecase } from '../../application/usecase/implementation/calendar/respond-to-schedule-request.usecase';
import { GetCalendarEventsUsecase } from '../../application/usecase/implementation/calendar/get-calendar-events.usecase';
import { GetDayDetailUsecase } from '../../application/usecase/implementation/calendar/get-day-detail.usecase';
import { MarkMissedSessionsUsecase } from '../../application/usecase/implementation/calendar/mark-missed-sessions.usecase';
import { ExpireScheduleRequestsUsecase } from '../../application/usecase/implementation/calendar/expire-schedule-requests.usecase';
import { GetPendingScheduleRequestsUsecase } from '../../application/usecase/implementation/calendar/get-pending-schedule-requests.usecase';
import { ProposeRecurringSessionUsecase } from '../../application/usecase/implementation/calendar/propose-recurring-session.usecase';

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
    container.register<IPausePomodoroUsecase>('IPausePomodoroUsecase', {
      useClass: PausePomodoroUsecase,
    });
    container.register<IResumePomodoroUsecase>('IResumePomodoroUsecase', {
      useClass: ResumePomodoroUsecase,
    });
    container.register<IExpireTodosUsecase>('IExpireTodosUsecase', {
      useClass: ExpireTodosUsecase,
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
    container.register<ICommunityGetMessagesUsecase>('ICommunityGetMessagesUsecase', { useClass: CommunityGetMessagesUsecase });
    container.register<ISendMessageUsecase>('ISendMessageUsecase', { useClass: SendMessageUsecase });
    
    // chat
    container.register<IGetConversationsUsecase>('IGetConversationsUsecase', { useClass: GetConversationsUsecase });
    container.register<IGetMessagesUsecase>('IGetMessagesUsecase', { useClass: ChatGetMessagesUsecase });
    container.register<ISendDirectMessageUsecase>('ISendDirectMessageUsecase', { useClass: SendDirectMessageUsecase });
    container.register<IMarkAsReadUsecase>('IMarkAsReadUsecase', { useClass: MarkAsReadUsecase });
    container.register<IStartChatSessionUsecase>('IStartChatSessionUsecase', { useClass: StartChatSessionUsecase });
    container.register<IEndChatSessionUsecase>('IEndChatSessionUsecase', { useClass: EndChatSessionUsecase });
    container.register<IDeleteChatUsecase>('IDeleteChatUsecase', { useClass: DeleteChatUsecase });


    //report
    container.register<ISubmitReportUsecase>  ('ISubmitReportUsecase',   { useClass: SubmitReportUsecase });
container.register<IResolveReportUsecase> ('IResolveReportUsecase',  { useClass: ResolveReportUsecase });
container.register<IGetReportsUsecase>    ('IGetReportsUsecase',     { useClass: GetReportsUsecase });
container.register<IGetReportByIdUsecase> ('IGetReportByIdUsecase',  { useClass: GetReportByIdUsecase });


    // calendar
    container.register<IStartSessionUsecase>               ('IStartSessionUsecase',               { useClass: StartSessionUsecase });
    container.register<IEndSessionUsecase>                 ('IEndSessionUsecase',                 { useClass: EndSessionUsecase });
    container.register<ISaveSessionNotesUsecase>           ('ISaveSessionNotesUsecase',           { useClass: SaveSessionNotesUsecase });
    container.register<IProposeNextSessionUsecase>         ('IProposeNextSessionUsecase',         { useClass: ProposeNextSessionUsecase });
    container.register<IProposeRecurringSessionUsecase>    ('IProposeRecurringSessionUsecase',    { useClass: ProposeRecurringSessionUsecase });
    container.register<IRespondToScheduleRequestUsecase>   ('IRespondToScheduleRequestUsecase',   { useClass: RespondToScheduleRequestUsecase });
    container.register<IGetCalendarEventsUsecase>          ('IGetCalendarEventsUsecase',          { useClass: GetCalendarEventsUsecase });
    container.register<IGetDayDetailUsecase>              ('IGetDayDetailUsecase',              { useClass: GetDayDetailUsecase });
    container.register<IMarkMissedSessionsUsecase>        ('IMarkMissedSessionsUsecase',        { useClass: MarkMissedSessionsUsecase });
    container.register<IExpireScheduleRequestsUsecase>    ('IExpireScheduleRequestsUsecase',    { useClass: ExpireScheduleRequestsUsecase });
    container.register<IGetPendingScheduleRequestsUsecase>('IGetPendingScheduleRequestsUsecase',{ useClass: GetPendingScheduleRequestsUsecase });
  }
}
