import express from "express";
import type { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { container } from "tsyringe";
import { config } from "./shared/config/index.js";
import { DependencyContainer } from "./infrastructure/di/index.js";
import { MongoConnect } from "./infrastructure/database/connection.js";
import { connectRedis } from "./infrastructure/config/redis.config.js";
import { AuthRoutes } from "./interface_adapter/routes/auth/auth-routes.js";
import { AdminRoutes } from "./interface_adapter/routes/admin/admin-routes.js";
import { UserRoutes } from "./interface_adapter/routes/user/user-routes.js";
import { ErrorMiddleware } from "./interface_adapter/middlewares/error.middleware.js";
import { TodoRoutes } from "./interface_adapter/routes/todo/todo.routes.js";
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
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private configureRoutes(): void {
    this.app.get('/', (_req, res) => res.send('Server is running'));
    this.app.use('/api/v1/auth', container.resolve(AuthRoutes).router);
    this.app.use('/api/v1/admin', container.resolve(AdminRoutes).router);
    this.app.use('/api/v1/user', container.resolve(UserRoutes).router);
     this.app.use('/api/v1/todos', container.resolve(TodoRoutes).router); 
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