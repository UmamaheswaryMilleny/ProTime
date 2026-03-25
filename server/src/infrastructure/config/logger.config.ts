import winston from "winston";
import fs from "fs";

import { config } from "../../shared/config/index";
import { LOGGER_CONSTANTS } from "../../shared/constants/constants";

const logDir = LOGGER_CONSTANTS.LOG_DIR;

// Create logs folder if not exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export const logger = winston.createLogger({
  level: config.logger.level,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "ProTime" },
  transports: [
    // Error logs
    new winston.transports.File({ filename: LOGGER_CONSTANTS.ERROR_LOG, level: "error" }),
    // All logs
    new winston.transports.File({ filename: LOGGER_CONSTANTS.COMBINED_LOG }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: LOGGER_CONSTANTS.EXCEPTIONS_LOG }),
  ],
});

// Only add console transport in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}