import type{ Request, Response, NextFunction } from "express";

export interface IAuthController {
  // AUTH
  register(req: Request, res: Response): Promise<void>;


  //sendotp
  sendOtp(req: Request, res: Response): Promise<void>;

  //resendotp
  resendOtp(req: Request, res: Response): Promise<void>;

  //verifyOtp
  verifyOtp(req: Request, res: Response): Promise<void>;

  //verifyotp and creating user
  verifyOtpAndCreateUser(req: Request, res: Response): Promise<void>;


  //Checking details and sendotp
  signupSendOtp(req: Request, res: Response): Promise<void>;



  //Refresh Token
  refreshToken(req: Request, res: Response): Promise<void>;


}