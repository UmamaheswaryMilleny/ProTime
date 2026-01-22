import type { Request, Response } from "express";

export interface IAdminUserController {
  getUsers(req: Request, res: Response): Promise<void>;
  getUserDetails(req: Request, res: Response): Promise<void>;
  blockUser(req: Request, res: Response): Promise<void>;
  unblockUser(req: Request, res: Response): Promise<void>;
}



