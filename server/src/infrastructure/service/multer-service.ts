import multer from "multer";
import path from "path";
import fs from "fs";
import { injectable } from "tsyringe";
import type { IMulterService } from "../../domain/service-interfaces/multer-service.interface.js";

@injectable()
export class MulterService implements IMulterService {
  private upload: multer.Multer;

  constructor() {
    const uploadPath = path.join(process.cwd(), "uploads/profile-images");

    // Ensure folder exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
      },
    });

    this.upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Only image files allowed"));
      },
    });
  }

  getMulter() {
    return this.upload;
  }
}
