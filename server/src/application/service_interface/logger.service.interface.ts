export interface RequestContext {
  method: string; //HTTP method (GET, POST)
  url: string;  //Endpoint path
  timestamp: string;
  ip?: string; //IP address
  userAgent?: string; //Browser / device info
}

export interface ErrorContext {
  // A stack trace is a list showing:Where the error happened and how the code reached there
  stack?: string;
  code?: string; //A custom error code
  statusCode?: number;
  userId?: string;
}

// Allows ANY extra structured data
export interface GenericContext {
  [key: string]: string | number | boolean | Date | null | undefined;
}

export type LogMeta = RequestContext | ErrorContext | GenericContext;

export interface ILoggerService {
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta): void;
  debug(message: string, meta?: LogMeta): void;
}