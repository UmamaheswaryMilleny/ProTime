// ─── Cloudinary Service Interface ────────────────────────────────────────────
// Abstracts all Cloudinary SDK calls. Infrastructure implements this.
// Application layer only depends on this interface — never on the SDK directly.

export interface ICloudinaryService {

  // Uploads an image buffer to Cloudinary.
  // folder:   e.g. 'protime/avatars' — organizes uploads in Cloudinary dashboard
  // publicId: unique identifier for the image — use userId so each user has one slot
  //           Uploading with the same publicId overwrites the old image automatically
  // Returns the secure HTTPS URL and the publicId stored in Cloudinary
  uploadImage(
    fileBuffer: Buffer,
    folder: string,
    publicId: string,
    mimetype: string,
  ): Promise<{ url: string; publicId: string }>;

//Cloudinary treats each upload as a replacement, not a new file. Same slot, same URL structure, no orphaned files. deleteImage on the interface exists for when you build account deletion — at that point you'll want to clean 
  deleteImage(publicId: string): Promise<void>;
}