import "express";
import  { JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedUser extends CustomJwtPayload {
  accessToken: string;
  refreshToken: string;
}

// You are modifying Express Request type globally.By default, Express Request does NOT have user.
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}