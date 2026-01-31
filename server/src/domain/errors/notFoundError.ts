import { HTTP_STATUS } from "../../shared/constants/constants.js";
import {CustomError} from "../errors/customError.js"

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(HTTP_STATUS.NOT_FOUND, message);
    // this.name = "NotFoundError";
  }
}


