import express from "express";
import type { Application } from "express";
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from "cors";
import cookieParser from "cookie-parser";
import { container } from "tsyringe";
import { config } from "./shared/config/index";
import { DependencyContainer } from "./infrastructure/di/index";
import { MongoConnect } from "./infrastructure/database/connection";
import { connectRedis } from "./infrastructure/config/redis.config";
import { logger } from "./infrastructure/config/logger.config";
import { AuthRoutes } from "./interface_adapter/routes/auth/auth-routes";
import { AdminRoutes } from "./interface_adapter/routes/admin/admin-routes";
import { UserRoutes } from "./interface_adapter/routes/user/user-routes";
import { ErrorMiddleware } from "./interface_adapter/middlewares/error.middleware";
import { TodoRoutes } from "./interface_adapter/routes/todo/todo.routes";
import { SubscriptionRoutes } from "./interface_adapter/routes/subscription/subscription.routes";
import { GamificationRoutes } from "./interface_adapter/routes/gamification/gamification.routes";
import { BuddyRoutes } from "./interface_adapter/routes/buddy-match/buddy.routes";
import { UtilityRoutes } from "./interface_adapter/routes/utility/utility-routes";
import { CommunityChatRoutes } from "./interface_adapter/routes/community-chat/community.routes";
import { SocketIOService } from "./infrastructure/service/socket-service";
import { JwtTokenService } from './infrastructure/service/token-service';
import { ROUTES } from "./shared/constants/constants.routes";
import { ChatRoutes } from './interface_adapter/routes/chat/chat.routes';
import { ConversationModel } from "./infrastructure/database/models/conversation.model";
import { ReportRoutes } from './interface_adapter/routes/report/report.routes';
import { CalendarRoutes } from "./interface_adapter/routes/calendar/calendar.routes";
import { startMarkMissedSessionsCron } from "./infrastructure/cron/mark-missed-sessions.cron";
import { startExpireScheduleRequestsCron } from "./infrastructure/cron/expire-schedule-requests.cron";
import { startExpireTodosCron } from "./infrastructure/cron/expire-todos.cron";

interface CustomSocket extends Socket {
  userId?: string;
}

export class App {
  private readonly app: Application;
  private readonly httpServer: http.Server;
  private readonly io: SocketIOServer;

  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: config.client.URI,
        credentials: true,
      },
    });

    this.configureCors();
    this.configureMiddleware();
    this.configureSocket();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureCors(): void {
    this.app.use(cors({ origin: config.client.URI, credentials: true }));
  }

  private configureMiddleware(): void {
    this.app.use((_req, res, next) => {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
      next();
    });
    this.app.use(
      express.json({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        verify: (req: any, _res, buf) => {
          if (req.originalUrl.includes('/webhook')) {
            req.rawBody = buf;
          }
        },
      }),
    );
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private configureRoutes(): void {
    this.app.get('/', (_req, res) => res.send('Server is running'));
    this.app.use(ROUTES.BASE.AUTH, container.resolve(AuthRoutes).router);
    this.app.use(ROUTES.BASE.ADMIN, container.resolve(AdminRoutes).router);
    this.app.use(ROUTES.BASE.USER, container.resolve(UserRoutes).router);
    this.app.use(ROUTES.BASE.TODO, container.resolve(TodoRoutes).router);
    this.app.use(ROUTES.BASE.SUBSCRIPTION, container.resolve(SubscriptionRoutes).router);
    this.app.use(ROUTES.BASE.GAMIFICATION, container.resolve(GamificationRoutes).router);
    this.app.use(ROUTES.BASE.BUDDY, container.resolve(BuddyRoutes).router);
    this.app.use(ROUTES.BASE.UTILITY, container.resolve(UtilityRoutes).router);
    this.app.use(ROUTES.BASE.COMMUNITY_CHAT, container.resolve(CommunityChatRoutes).router);
    this.app.use(ROUTES.BASE.CHAT, container.resolve(ChatRoutes).router);
  this.app.use(ROUTES.BASE.REPORTS, container.resolve(ReportRoutes).router)
  this.app.use('/api/v1/calendar', container.resolve(CalendarRoutes).router);
  }
  private configureSocket(): void {
    const tokenService = new JwtTokenService();

    this.io.use((socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!token) return next(new Error('Authentication required'));

        const payload = tokenService.verifyAccess(token);
        if (!payload) return next(new Error('Invalid or expired token'));

        (socket as any).userId = payload.id;
        next();
      } catch {
        next(new Error('Invalid or expired token'));
      }
    });

    const socketService = new SocketIOService(this.io);
    container.register('ISocketService', { useValue: socketService });

    this.io.on('connection', (socket) => {
      const userId = (socket as any).userId as string;
      logger.info(`[Socket] User connected: ${userId}`);

      // Track online status
      socketService.setUserOnline(userId, socket.id);
      this.io.emit('user:online', { userId });

      // Join conversation rooms — client sends list of conversationIds
      socket.on('join:conversations', (conversationIds: string[]) => {
        conversationIds.forEach(id => socket.join(`conversation:${id}`));
      });

      socket.on('disconnect', () => {
        socketService.setUserOffline(userId);
        this.io.emit('user:offline', { userId });
        logger.info(`[Socket] User disconnected: ${userId}`);
      });

      // ─── WebRTC Signaling ─────────────────────────────────────────────────

      // 1. Caller sends offer → find callee and forward
      socket.on('webrtc:offer', async (data: { conversationId: string; offer: RTCSessionDescriptionInit }) => {
        try {
          const conversation = await ConversationModel.findById(data.conversationId).lean();
          if (!conversation) return;

          // Determine which participant is the callee (not the caller)
          const calleeId = conversation.user1Id.toString() === userId
            ? conversation.user2Id.toString()
            : conversation.user1Id.toString();

          socketService.emitToUser(calleeId, 'webrtc:offer', {
            conversationId: data.conversationId,
            offer: data.offer,
            callerName: 'Buddy', // resolved on client via Redux conversations state
          });
        } catch (err) {
          logger.error('[Socket] webrtc:offer relay error:', { error: err });
        }
      });

      // 2. Callee sends answer → forward back to caller
      socket.on('webrtc:answer', async (data: { conversationId: string; answer: RTCSessionDescriptionInit }) => {
        try {
          const conversation = await ConversationModel.findById(data.conversationId).lean();
          if (!conversation) return;

          // Caller is the other participant
          const callerId = conversation.user1Id.toString() === userId
            ? conversation.user2Id.toString()
            : conversation.user1Id.toString();

          socketService.emitToUser(callerId, 'webrtc:answer', {
            conversationId: data.conversationId,
            answer: data.answer,
          });
        } catch (err) {
          logger.error('[Socket] webrtc:answer relay error:', { error: err });
        }
      });

      // 3. ICE candidates — relay to the other participant
      socket.on('webrtc:ice-candidate', async (data: { conversationId: string; candidate: RTCIceCandidateInit }) => {
        try {
          const conversation = await ConversationModel.findById(data.conversationId).lean();
          if (!conversation) return;

          const peerId = conversation.user1Id.toString() === userId
            ? conversation.user2Id.toString()
            : conversation.user1Id.toString();

          socketService.emitToUser(peerId, 'webrtc:ice-candidate', {
            conversationId: data.conversationId,
            candidate: data.candidate,
          });
        } catch (err) {
          logger.error('[Socket] webrtc:ice-candidate relay error:', { error: err });
        }
      });

      // 4. Call ended — notify everyone in the conversation room
      socket.on('webrtc:call-ended', (data: { conversationId: string }) => {
        socketService.emitToConversation(data.conversationId, 'webrtc:call-ended', {
          conversationId: data.conversationId,
        });
      });
    });
  }

  private configureErrorHandling(): void {
    const errorMiddleware = new ErrorMiddleware();
    this.app.use(errorMiddleware.handleError.bind(errorMiddleware));
  }

  public getApp(): Application {
    return this.app;
  }

  public getHttpServer(): http.Server {
    return this.httpServer;
  }
}

// ✅ Bootstrap — controls startup order
export const bootstrap = async (): Promise<void> => {
  DependencyContainer.registerAll();        // 1. DI first
  await new MongoConnect().connectDB();     // 2. MongoDB second
  await connectRedis();                     // 3. Redis third
  const appInstance = new App();            // 4. App last
  appInstance.getHttpServer().listen(config.server.port, () => {
    logger.info(`🚀 Server running on port ${config.server.port}`);

  });
  startMarkMissedSessionsCron();
startExpireScheduleRequestsCron();
};