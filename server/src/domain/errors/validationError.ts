import { HTTP_STATUS } from "../../shared/constants/constants.js";
import { CustomError } from "./customError.js";

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(HTTP_STATUS.BAD_REQUEST, message);
    this.name = "ValidationError";
  }
}