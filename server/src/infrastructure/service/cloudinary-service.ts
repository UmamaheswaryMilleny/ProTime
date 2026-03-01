import { injectable } from 'tsyringe';
import { cloudinary } from '../config/cloudinary.config.js';
import type { ICloudinaryService } from '../../application/service_interface/cloudinary.service.interface.js';

@injectable()
export class CloudinaryService implements ICloudinaryService {


  async uploadImage(
    fileBuffer: Buffer,
    folder: string,
    publicId: string,
    mimetype: string,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      // Use upload_stream to accept a Buffer instead of a file path
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id:      publicId,
          overwrite:      true,       // replaces existing image with same publicId
          resource_type:  'image',
          format:         mimetype.split('/')[1], // 'jpeg' | 'png' | 'webp'
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // auto-crop to face
            { quality: 'auto', fetch_format: 'auto' },                  // optimise delivery
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary upload failed'));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );

      // Write the buffer into the stream
      uploadStream.end(fileBuffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}