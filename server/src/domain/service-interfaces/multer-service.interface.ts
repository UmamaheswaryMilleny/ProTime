import type { Multer } from "multer";

export interface IMulterService {
  getMulter(): Multer;
}
