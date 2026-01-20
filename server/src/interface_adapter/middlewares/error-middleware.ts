import type { NextFunction,Response,Request } from "express";
import { CustomError } from "../../domain/errors/customError.js";
import { NotFoundError } from "../../domain/errors/notFoundError.js";
import { ValidationError } from "../../domain/errors/validationError.js";
import { HTTP_STATUS,ERROR_MESSAGE } from "../../shared/constants/constants.js";
import type { IErrorMiddleware } from "../interfaces/auth/error-middleware-interface.js";
export class ErrorMiddleware implements IErrorMiddleware {
  public handleError(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
  ): void {
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = ERROR_MESSAGE.AUTHENTICATION.SERVER_ERROR;

    if (err instanceof CustomError) {
      statusCode = err.statusCode;
      message = err.message;
      if (err instanceof ValidationError) {
        message = err.message;
      }
    } else if (err instanceof NotFoundError) {
      statusCode = err.statusCode;
      message = err.message;
    }

    console.error(
      `statusCode ${statusCode}`,
      `message ${message}, error : ${err}`
    );

    res.status(statusCode).json({ success: false, message });
  }
}