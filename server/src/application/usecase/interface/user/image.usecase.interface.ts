// Returns the updated profile response after saving the new image URL.
// fileBuffer: raw image bytes from multer memory storage
// mimetype:   e.g. 'image/jpeg' — passed to Cloudinary for format detection
export interface IUploadProfileImageUsecase {
  execute(
    userId: string,
    fileBuffer: Buffer,
    mimetype: string,
  ): Promise<{ profileImage: string }>;
}