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
import { AuthRoutes } from "./interface_adapter/routes/auth/auth-routes";
import { AdminRoutes } from "./interface_adapter/routes/admin/admin-routes";
import { UserRoutes } from "./interface_adapter/routes/user/user-routes";
import { ErrorMiddleware } from "./interface_adapter/middlewares/error.middleware";
import { TodoRoutes } from "./interface_adapter/routes/todo/todo.routes";
import { SubscriptionRoutes } from "./interface_adapter/routes/subscription/subscription.routes";
import { GamificationRoutes } from "./interface_adapter/routes/gamification/gamification.routes";
import { BuddyRoutes } from "./interface_adapter/routes/buddy-match/buddy.routes";
import { UtilityRoutes } from "./interface_adapter/routes/utility/utility-routes";
import { SocketIOService } from "./infrastructure/service/socket-service";
import { JwtTokenService } from './infrastructure/service/token-service';

export class App {
  private readonly app:        Application;
  private readonly httpServer: http.Server;
  private readonly io:         SocketIOServer;

  constructor() {
    this.app        = express();
    this.httpServer = http.createServer(this.app);
    this.io         = new SocketIOServer(this.httpServer, {
      cors: {
        origin:      config.client.URI,
        credentials: true,
      },
    });

    this.configureCors();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureSocket();        // ← was missing from constructor
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
    this.app.use('/api/v1/auth',         container.resolve(AuthRoutes).router);
    this.app.use('/api/v1/admin',        container.resolve(AdminRoutes).router);
    this.app.use('/api/v1/user',         container.resolve(UserRoutes).router);
    this.app.use('/api/v1/todos',        container.resolve(TodoRoutes).router);
    this.app.use('/api/v1/subscription', container.resolve(SubscriptionRoutes).router);
    this.app.use('/api/v1/gamification', container.resolve(GamificationRoutes).router);
    this.app.use('/api/v1/buddy',        container.resolve(BuddyRoutes).router);
    this.app.use('/api/v1/utility',      container.resolve(UtilityRoutes).router);
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

    this.io.on('connection', (socket) => {
      const userId = (socket as any).userId as string;
      console.log(`[Socket] User connected: ${userId}`);
      socket.on('disconnect', () => {
        console.log(`[Socket] User disconnected: ${userId}`);
      });
    });

    const socketService = new SocketIOService(this.io);
    container.register('ISocketService', { useValue: socketService });
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
    console.log(`🚀 Server running on port ${config.server.port}`);
  });
};