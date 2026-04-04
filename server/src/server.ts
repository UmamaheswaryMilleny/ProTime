import express from "express";
import type { Application } from "express";
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from "cors";
import cookieParser from "cookie-parser";
import { container } from "tsyringe";
import { config } from "./shared/config/index";
import { DependencyContainer } from "./infrastructure/di/index";
import { MongoConnect } from "./infrastructure/database/connection";
import { connectRedis } from "./infrastructure/config/redis.config";
import { logger } from "./infrastructure/config/logger.config";
import { MessageType } from "./domain/enums/chat.enums";
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
import { StudyRoomRoutes } from "./interface_adapter/routes/study-room/study-room.routes";
import { startMarkMissedSessionsCron } from "./infrastructure/cron/mark-missed-sessions.cron";
import { startExpireScheduleRequestsCron } from "./infrastructure/cron/expire-schedule-requests.cron";
import { startExpireTodosCron } from "./infrastructure/cron/expire-todos.cron";
import { ProBuddyRoutes } from "./interface_adapter/routes/probuddy/probuddy.routes";



export class App {
  private readonly app: Application;
  private readonly httpServer: http.Server;
  private readonly io: SocketIOServer;

  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: (origin, callback) => {
          const allowed = [config.client.URI, 'http://localhost:5173', 'http://localhost:5174'];
          if (!origin || allowed.includes(origin) || origin.startsWith('http://localhost:')) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
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
    this.app.use(cors({ 
      origin: (origin, callback) => {
        const allowed = [config.client.URI, 'http://localhost:5173', 'http://localhost:5174'];
        if (!origin || allowed.includes(origin) || origin.startsWith('http://localhost:')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }, 
      credentials: true 
    }));
  }

  private configureMiddleware(): void {
    this.app.use((_req, res, next) => {
      // res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
      res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
      next();
    });
    this.app.use(
      express.json({
         
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
    this.app.use(ROUTES.BASE.ROOMS, container.resolve(StudyRoomRoutes).router);
    this.app.use(ROUTES.BASE.PROBUDDY, container.resolve<ProBuddyRoutes>(ProBuddyRoutes).router);
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

      socket.on('join:conversations', (conversationIds: string[]) => {
        conversationIds.forEach(id => socket.join(`conversation:${id}`));
      });

      socket.on('chat:enter', (conversationId: string) => {
        socketService.setActiveRoom(userId, conversationId);
      });

      socket.on('chat:leave', () => {
        socketService.clearActiveRoom(userId);
      });

      // Study Rooms
      socket.on('join:room', (roomId: string) => {
        socket.join(`room:${roomId}`);
      });

      socket.on('leave:room', (roomId: string) => {
        socket.leave(`room:${roomId}`);
      });

      socket.on('disconnect', () => {
        socketService.setUserOffline(userId);
        this.io.emit('user:offline', { userId });
        logger.info(`[Socket] User disconnected: ${userId}`);
      });

      // ─── WebRTC Signaling ─────────────────────────────────────────────────

      // 1. Caller sends offer → find callee and forward
      socket.on('webrtc:offer', async (data: { conversationId: string; offer: RTCSessionDescriptionInit; callerName?: string }) => {
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
            callerName: data.callerName || 'Buddy',
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

      // 5. Missed call — notify the callee
      socket.on('webrtc:missed-call', async (data: { conversationId: string; callerName: string }) => {
        try {
          const conversation = await ConversationModel.findById(data.conversationId).lean();
          if (!conversation) return;

          const calleeId = conversation.user1Id.toString() === userId
            ? conversation.user2Id.toString()
            : conversation.user1Id.toString();

          socketService.emitToUser(calleeId, 'notification:new', {
            type: 'missed_call',
            title: 'Missed Video Call 📹',
            message: `You missed a video call from ${data.callerName}.`,
          });

          // Insert a system message into the chat room
          const sendDirectMessageUsecase = container.resolve<any>('ISendDirectMessageUsecase');
          const response = await sendDirectMessageUsecase.execute(
            userId,
            data.conversationId,
            {
              content: `📹 Missed video call`,
              messageType: MessageType.SYSTEM,
            }
          );
          
          // Emit the message back to the caller so it updates their local chat UI as well
          socketService.emitToUser(userId, 'chat:message', response);
        } catch (err) {
          logger.error('[Socket] webrtc:missed-call relay error:', { error: err });
        }
      });

      // ─── Group Video WebRTC Signaling ──────────────────────────────────────

      socket.on('room:webrtc:offer', (data: { targetUserId: string; roomId: string; offer: RTCSessionDescriptionInit }) => {
        socketService.emitToUser(data.targetUserId, 'room:webrtc:offer', {
          senderId: userId,
          roomId: data.roomId,
          offer: data.offer,
        });
      });

      socket.on('room:webrtc:answer', (data: { targetUserId: string; roomId: string; answer: RTCSessionDescriptionInit }) => {
        socketService.emitToUser(data.targetUserId, 'room:webrtc:answer', {
          senderId: userId,
          roomId: data.roomId,
          answer: data.answer,
        });
      });

      socket.on('room:webrtc:ice-candidate', (data: { targetUserId: string; roomId: string; candidate: RTCIceCandidateInit }) => {
        socketService.emitToUser(data.targetUserId, 'room:webrtc:ice-candidate', {
          senderId: userId,
          roomId: data.roomId,
          candidate: data.candidate,
        });
      });

      socket.on('room:webrtc:camera-toggle', (data: { roomId: string; isVideoOn: boolean }) => {
        socketService.emitToRoom(data.roomId, 'room:webrtc:camera-toggle', {
          userId,
          isVideoOn: data.isVideoOn
        });
      });

      socket.on('room:webrtc:mic-toggle', (data: { roomId: string; isAudioOn: boolean }) => {
        socketService.emitToRoom(data.roomId, 'room:webrtc:mic-toggle', {
          userId,
          isAudioOn: data.isAudioOn
        });
      });

      // ─── Pomodoro Signaling Relay ──────────────────────────────────────────
      
      socket.on('pomodoro:start', async (data: { conversationId: string, task: any, duration: number }) => {
        try {
          const conversation = await ConversationModel.findById(data.conversationId).lean();
          if (!conversation) return;
          const peerId = conversation.user1Id.toString() === userId ? conversation.user2Id.toString() : conversation.user1Id.toString();
          socketService.emitToUser(peerId, 'pomodoro:start', { ...data, startedBy: userId });
        } catch (err) { logger.error('[Socket] pomodoro:start relay error:', err); }
      });

      socket.on('pomodoro:pause', async (data: { conversationId: string }) => {
        try {
          const conversation = await ConversationModel.findById(data.conversationId).lean();
          if (!conversation) return;
          const peerId = conversation.user1Id.toString() === userId ? conversation.user2Id.toString() : conversation.user1Id.toString();
          socketService.emitToUser(peerId, 'pomodoro:pause', data);
        } catch (err) { logger.error('[Socket] pomodoro:pause relay error:', err); }
      });

      socket.on('pomodoro:resume', async (data: { conversationId: string }) => {
        try {
          const conversation = await ConversationModel.findById(data.conversationId).lean();
          if (!conversation) return;
          const peerId = conversation.user1Id.toString() === userId ? conversation.user2Id.toString() : conversation.user1Id.toString();
          socketService.emitToUser(peerId, 'pomodoro:resume', data);
        } catch (err) { logger.error('[Socket] pomodoro:resume relay error:', err); }
      });

      socket.on('pomodoro:stop', async (data: { conversationId: string }) => {
        try {
          const conversation = await ConversationModel.findById(data.conversationId).lean();
          if (!conversation) return;
          const peerId = conversation.user1Id.toString() === userId ? conversation.user2Id.toString() : conversation.user1Id.toString();
          socketService.emitToUser(peerId, 'pomodoro:stop', data);
        } catch (err) { logger.error('[Socket] pomodoro:stop relay error:', err); }
      });

      socket.on('pomodoro:tick', async (data: { conversationId: string, timeRemaining: number }) => {
        try {
          const conversation = await ConversationModel.findById(data.conversationId).lean();
          if (!conversation) return;
          const peerId = conversation.user1Id.toString() === userId ? conversation.user2Id.toString() : conversation.user1Id.toString();
          socketService.emitToUser(peerId, 'pomodoro:sync', { ...data, type: 'TICK' });
        } catch (_err) { /* Silent for high-frequency events */ }
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
  startExpireTodosCron();
};