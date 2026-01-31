import { injectable } from "tsyringe";
import { logger } from "../logger/winston-logger-config.js";
import type { ILogger,LogMeta } from "../../domain/service-interfaces/logger.interface.js";



@injectable()
export class WinstonLoggerAdapter implements ILogger {
  info(message: string, meta?: LogMeta): void {
    logger.info(message, meta);
  }

  error(message: string, meta?: LogMeta): void {
    logger.error(message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    logger.warn(message, meta);
  }

  debug(message: string, meta?: LogMeta): void {
    logger.debug(message, meta);
  }
}