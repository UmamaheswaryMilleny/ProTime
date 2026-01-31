import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { ILogger } from "../../domain/service-interfaces/logger.interface.js";
@injectable()
export class LoggerMiddleware {
  constructor(
    @inject("ILogger") private logger: ILogger
  ) {}

  public handle(req: Request, res: Response, next: NextFunction) {
    
    //  console.log("LoggerMiddleware working---------------->",req.method,req.url)
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