export interface RequestContext {
  method: string;
  url: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

export interface ErrorContext {
  stack?: string;
  code?: string;
  statusCode?: number;
  userId?: string;
}

export interface GenericContext {
  [key: string]: string | number | boolean | Date | null | undefined;
}

export type LogMeta = RequestContext | ErrorContext | GenericContext;

export interface ILogger {
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta): void;
  debug(message: string, meta?: LogMeta): void;
}