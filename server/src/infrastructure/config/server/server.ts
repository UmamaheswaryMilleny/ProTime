import express from 'express';
import type { Application } from 'express';
import cors from 'cors';
import { config } from '../../../shared/config.js';
import cookieParser from 'cookie-parser';
import {
  authRoutes,
  adminRoutes,
  errorMiddleware,
  userRoutes,
} from '../../dependencyinjection/resolve.js';

// Create and configure the HTTP server
export class App {
  private _app: Application;
  constructor() {
    this._app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorMiddleware();
  }

  private configureMiddleware() {
    this._app.use(
      cors({
        origin: config.client.URI,
        credentials: true,
      }),
    );
    this._app.use(express.json());
    this._app.use(express.urlencoded({ extended: true }));
    this._app.use(cookieParser());

    this._app.use((req, res, next) => {
      console.log(req.url);
      next();
    });
  }

  private configureRoutes() {
    this._app.get("/", (req, res) => {
    res.send("Server working 🚀");
  });
    this._app.use('/api/v1/auth', authRoutes.router);
    this._app.use('/api/v1/admin', adminRoutes.router);

    this._app.use('/api/v1/user', userRoutes.router);
  }

  private configureErrorMiddleware() {
    this._app.use(errorMiddleware.handleError.bind(errorMiddleware));
  }

  public getApp(): Application {
    return this._app;
  }
}
