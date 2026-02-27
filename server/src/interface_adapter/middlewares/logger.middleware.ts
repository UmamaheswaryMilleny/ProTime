import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { ILoggerService } from "../../application/service_interface/logger.service.interface.js";

@injectable()
export class LoggerMiddleware {
  constructor(
    @inject("ILoggerService")
    private readonly logger: ILoggerService,
  ) {}

  /**
   * handle — logs method, url, ip, and user agent for every request
   * Register early in middleware chain to capture all requests
   */
  public handle(req: Request, _res: Response, next: NextFunction): void {
    this.logger.info("Incoming Request", {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    next();
  }
}
