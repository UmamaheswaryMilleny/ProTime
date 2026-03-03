//user select image multer reads it gives raw bytes which is buffer and this is passed to cloudinary
export interface IUploadProfileImageUsecase {
  execute(
    userId: string,
    fileBuffer: Buffer,
    mimetype: string, //it tell you what type of file uploaded like jpeg,png
  ): Promise<{ profileImage: string }>;
}