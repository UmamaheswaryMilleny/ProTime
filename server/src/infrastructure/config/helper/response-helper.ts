import type { Response } from "express";
// standardizes how your API sends responses to the client.
export class ResponseHelper {
  static success<T>(
    res: Response,
    statusCode: number = 200,
    message?: string,
    payload?: T,
    key: string = "data"
  ): Response {
    const baseResponse = {
      success: true as const,
      ...(message && { message })
    };

    const responseWithPayload = payload !== undefined 
      ? { ...baseResponse, [key]: payload }
      : baseResponse;

    return res.status(statusCode).json(responseWithPayload);
  }

  static paginated<T>(
    res: Response,
    data: T,
    totalPages: number,
    currentPage: number,
    message?: string,
    dataKey: string = "data"
  ): Response {
    const responseBody = {
      success: true as const,
      [dataKey]: data,
      currentPage,
      totalPages,
      ...(message && { message })
    };

    return res.status(200).json(responseBody);
  }

  static error(res: Response, message: string, statusCode: number = 500): Response {
    return res.status(statusCode).json({ 
      success: false as const, 
      message 
    });
  }
}