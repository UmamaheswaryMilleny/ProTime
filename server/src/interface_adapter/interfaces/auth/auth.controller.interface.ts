import type { Request, Response, NextFunction } from "express";

export interface IAuthController {
  register(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  sendOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  resendOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  logout(req: Request, res: Response, next: NextFunction): Promise<void>;
  refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
  forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  verifyResetToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  googleAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
}
