import { inject, injectable } from "tsyringe";
import type { IMulterService } from "../../../domain/service-interfaces/multer-service.interface.js";

@injectable()
export class ProfileUploadController {
  private upload;

  constructor(@inject("IMulterService") private multerService: IMulterService) {
    this.upload = this.multerService.getMulter();
  }

  // ✅ Multer middleware
  uploadMiddleware() {
    return this.upload.single("image"); // MUST MATCH FRONTEND
  }

  // ✅ Controller
  async uploadProfileImage(req: any, res: any) {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // If using disk storage
    const imageUrl = `/uploads/${req.file.filename}`;

    return res.status(200).json({
      imageUrl,
    });
  }
}
