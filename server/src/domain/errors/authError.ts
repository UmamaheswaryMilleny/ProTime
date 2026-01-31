import { CustomError } from "./customError.js";
export class AuthError extends CustomError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);

  }
}

