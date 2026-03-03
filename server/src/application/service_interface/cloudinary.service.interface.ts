
export interface ICloudinaryService {

  uploadImage(
    fileBuffer: Buffer, //raw image bytes from Multer
    folder: string, //where to store in Cloudinary
    publicId: string, //filename in Cloudinary
    mimetype: string,
  ): Promise<{ url: string; publicId: string }>;

//Cloudinary treats each upload as a replacement
  deleteImage(publicId: string): Promise<void>;
}