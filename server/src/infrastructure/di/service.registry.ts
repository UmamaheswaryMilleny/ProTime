import { container } from 'tsyringe';

// Domain interfaces
import type { IUserRepository } from '../../domain/repositories/user/user.repository.interface';
import type { IEmailService } from '../../application/service_interface/email.service.interface';
import type { ITokenService } from '../../application/service_interface/token.service.interface';
import type { IOtpService } from '../../application/service_interface/otp.service.interface';
import type { IPasswordHasherService } from '../../application/service_interface/password-hasher.service.interface';
import type { ITempUserService } from '../../application/service_interface/temp-user.service.interface';
import type { IRefreshTokenStore } from '../../application/service_interface/refresh-token-store-service.interface';
import type { IResetTokenStore } from '../../application/service_interface/reset-token-store.service.interface';
import type { IgoogleAuth } from '../../application/service_interface/google-auth.service.interface';
import type { ILoggerService } from '../../application/service_interface/logger.service.interface';

// Infrastructure implementations
import { MongoUserRepository } from '../repositories/user/user.repository';
import { NodemailerEmailService } from '../service/email-service';
import { JwtTokenService } from '../service/token-service';
import { OtpService } from '../service/otp-service';
import { PasswordHasherService } from '../service/password-service';
import { TempUserService } from '../service/temp-user-service';
import { RedisRefreshTokenStore } from '../service/refresh-token-store';
import { RedisResetTokenStore } from '../service/reset-token.store';
import { GoogleAuthService } from '../service/auth-service';
import { WinstonLoggerAdapter } from '../service/logger-service';
import type { IProfileRepository } from '../../domain/repositories/profile/profile.repository.interface';
import { MongoProfileRepository } from '../repositories/user/profile.repository';

//Todo
import type { ITodoRepository } from '../../domain/repositories/todo/todo.repository.interface';
import { MongoTodoRepository } from '../repositories/todo/todo.repository';
import type { ICloudinaryService } from '../../application/service_interface/cloudinary.service.interface';
import { CloudinaryService } from '../service/cloudinary-service';

//gamification
import { IGamificationRepository } from '../../domain/repositories/gamification/gamification.repository.interface';
import { IBadgeDefinitionRepository } from '../../domain/repositories/gamification/gamification.repository.interface';
import { IUserBadgeRepository } from '../../domain/repositories/gamification/gamification.repository.interface';
import { MongoGamificationRepository } from '../repositories/gamification/gamification.repository';
import { MongoBadgeDefinitionRepository } from '../repositories/gamification/badge.repository';
import { MongoUserBadgeRepository } from '../repositories/gamification/badge.repository';

//subscription

// ─── Subscription ─────────────────────────────────────────────────────────────
import type { ISubscriptionRepository } from '../../domain/repositories/subscription/subscription.repository.interface';
import type { IStripeService } from '../../application/service_interface/stripe.service.interface';
import { SubscriptionRepository } from '../repositories/subscription/subscription.repository';
import { StripeService } from '../service/stripe-service';
//upload service

//buddy-match
import type { IBuddyPreferenceRepository } from '../../domain/repositories/buddy/buddy.preference.repository.interface';
import type { IBuddyConnectionRepository } from '../../domain/repositories/buddy/buddy.connection.repository.interface';

import { BuddyConnectionRepository } from '../repositories/buddy-match/buddy-connection.repository';
import { BuddyPreferenceRepository } from '../repositories/buddy-match/buddy-preference.repository';

// usecases

//middlewares
import { BlockedUserMiddleware } from '../../interface_adapter/middlewares/blocked-user.middleware';

//community
import type { ICommunityMessageRepository } from '../../domain/repositories/community/community.repository.interface';
import { CommunityMessageRepository } from '../repositories/community/community.repository';

// chat
import type { IConversationRepository } from '../../domain/repositories/chat/conversation.repository.interface';
import type { IDirectMessageRepository } from '../../domain/repositories/chat/direct-message.repository.interface';
import type { IChatSessionRepository } from '../../domain/repositories/chat/chat-session.repository.interface';
import { ConversationRepository } from '../repositories/chat/conversation.repository';
import { DirectMessageRepository } from '../repositories/chat/direct-message.repository';
import { ChatSessionRepository } from '../repositories/chat/chat-session.repository';


export class ServiceRegistry {
  static register(): void {
    // ─── Repositories ────────────────────────────────────────────────
    container.register<IUserRepository>('IUserRepository', {
      useClass: MongoUserRepository,
    });
    container.register<ITodoRepository>('ITodoRepository', {
      useClass: MongoTodoRepository,
    });
    // ─── Auth Services ────────────────────────────────────────────────
    container.register<ITokenService>('ITokenService', {
      useClass: JwtTokenService,
    });

    container.register<IPasswordHasherService>('IPasswordHasherService', {
      useClass: PasswordHasherService,
    });

    container.register<IgoogleAuth>('SocialAuthPort', {
      useClass: GoogleAuthService,
    });

    // ─── Token Stores ─────────────────────────────────────────────────
    container.register<IRefreshTokenStore>('IRefreshTokenStore', {
      useClass: RedisRefreshTokenStore,
    });

    container.register<IResetTokenStore>('ResetTokenStore', {
      useClass: RedisResetTokenStore,
    });

    // ─── OTP & Temp User ──────────────────────────────────────────────
    container.register<IOtpService>('IOtpService', {
      useClass: OtpService,
    });

    container.register<ITempUserService>('ITempUserService', {
      useClass: TempUserService,
    });

    // ─── Email ────────────────────────────────────────────────────────
    container.register<IEmailService>('IEmailService', {
      useClass: NodemailerEmailService,
    });

    // ─── Logger ───────────────────────────────────────────────────────
    container.register<ILoggerService>('ILoggerService', {
      useClass: WinstonLoggerAdapter,
    });
    container.register<IProfileRepository>('IProfileRepository', {
      useClass: MongoProfileRepository,
    });

    container.register<ICloudinaryService>('ICloudinaryService', {
      useClass: CloudinaryService,
    });

    //gamification
    container.register<IGamificationRepository>('IGamificationRepository', {
      useClass: MongoGamificationRepository,
    });
    container.register<IBadgeDefinitionRepository>(
      'IBadgeDefinitionRepository',
      {
        useClass: MongoBadgeDefinitionRepository,
      },
    );
    container.register<IUserBadgeRepository>('IUserBadgeRepository', {
      useClass: MongoUserBadgeRepository,
    });

    //subscription
    // ─── Subscription ─────────────────────────────────────────────────────────────
    container.register<ISubscriptionRepository>('ISubscriptionRepository', {
      useClass: SubscriptionRepository,
    });

    container.register<IStripeService>('IStripeService', {
      useClass: StripeService,
    });

    //buddy match
    container.register<IBuddyPreferenceRepository>(
      'IBuddyPreferenceRepository',
      { useClass: BuddyPreferenceRepository },
    );
    container.register<IBuddyConnectionRepository>(
      'IBuddyConnectionRepository',
      { useClass: BuddyConnectionRepository },
    );

    // Middlewares
    container.register(BlockedUserMiddleware, {
      useClass: BlockedUserMiddleware,
    });
    container.register<ICommunityMessageRepository>(
      'ICommunityMessageRepository',
      {
        useClass: CommunityMessageRepository,
      },
    );

    container.register<IConversationRepository>('IConversationRepository', { useClass: ConversationRepository });
    container.register<IDirectMessageRepository>('IDirectMessageRepository', { useClass: DirectMessageRepository });
    container.register<IChatSessionRepository>('IChatSessionRepository', { useClass: ChatSessionRepository });
  }
}
