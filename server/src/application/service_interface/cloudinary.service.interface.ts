
export interface ICloudinaryService {

  uploadImage(
    fileBuffer: Buffer, //raw image bytes from Multer
    folder: string, //where to store in Cloudinary
    publicId: string, //filename in Cloudinary
    mimetype: string,
  ): Promise<{ url: string; publicId: string }>;


  deleteImage(publicId: string): Promise<void>;
}