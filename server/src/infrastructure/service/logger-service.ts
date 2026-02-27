import { injectable } from "tsyringe";
import { logger } from "../config/logger.config";
import {
  ILoggerService,
  LogMeta,
} from "../../application/service_interface/logger.service.interface";

@injectable()
export class WinstonLoggerAdapter implements ILoggerService {
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
