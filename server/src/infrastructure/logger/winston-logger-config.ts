import winston from "winston";
import fs from "fs";

const logDir = "logs";

// Create logs folder if not exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "ProTime" },

  transports: [
    // Console logs (pretty for dev)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // Error logs
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),

    // All logs
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],

  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  ],
});

if (process.env.NODE_ENV === "production") {
  logger.remove(new winston.transports.Console());
}