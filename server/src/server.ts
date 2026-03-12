import express from "express";
import type { Application } from "express";
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

export class App {
  private readonly app: Application;

  constructor() {
    this.app = express();
    this.configureCors();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureCors(): void {
    this.app.use(cors({ origin: config.client.URI, credentials: true }));
  }

  private configureMiddleware(): void {
    // ─── Global JSON Parser with Raw Body preservation for Webhooks ───
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
    this.app.use('/api/v1/auth', container.resolve(AuthRoutes).router);
    this.app.use('/api/v1/admin', container.resolve(AdminRoutes).router);
    this.app.use('/api/v1/user', container.resolve(UserRoutes).router);
     this.app.use('/api/v1/todos', container.resolve(TodoRoutes).router); 
     this.app.use('/api/v1/subscription', container.resolve(SubscriptionRoutes).router); 
     this.app.use('/api/v1/gamification', container.resolve(GamificationRoutes).router); 
  }

  private configureErrorHandling(): void {
    const errorMiddleware = new ErrorMiddleware();
    this.app.use(errorMiddleware.handleError.bind(errorMiddleware));
  }

  public getApp(): Application {
    return this.app;
  }
}

// ✅ Bootstrap — controls startup order
export const bootstrap = async (): Promise<void> => {
  DependencyContainer.registerAll();        // 1. DI first
  await new MongoConnect().connectDB();     // 2. MongoDB second
  await connectRedis();                     // 3. Redis third
  const app = new App().getApp();           // 4. Express last
  app.listen(config.server.port, () => {
    console.log(`🚀 Server running on port ${config.server.port}`);
  });
};