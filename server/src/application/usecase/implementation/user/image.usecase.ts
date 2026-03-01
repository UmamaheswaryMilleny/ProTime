import { inject, injectable } from 'tsyringe';
import type { IUploadProfileImageUsecase } from '../../interface/user/image.usecase.interface';
import type { ICloudinaryService } from '../../../service_interface/cloudinary.service.interface';
import type { IProfileRepository } from '../../../../domain/repositories/profile/profile.repository.interface';
import { ProfileNotFoundError } from '../../../../domain/errors/profile.error';

@injectable()
export class UploadProfileImageUsecase implements IUploadProfileImageUsecase {
  constructor(
    @inject('ICloudinaryService')
    private readonly cloudinaryService: ICloudinaryService,

    @inject('ProfileRepository')
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(
    userId: string,
    fileBuffer: Buffer,
    mimetype: string,
  ): Promise<{ profileImage: string }> {
    // 1. Get current profile — need to check for existing image
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new ProfileNotFoundError();

    // 2. Upload new image to Cloudinary
    //    publicId = userId so each user occupies exactly one slot —
    //    uploading again overwrites the old file automatically
    const { url } = await this.cloudinaryService.uploadImage(
      fileBuffer,
      'protime/avatars',
      `avatar_${userId}`,
      mimetype,
    );

    // 3. Save the new URL to the profile
    await this.profileRepository.updateByUserId(userId, { profileImage: url });

    // 4. Return just the new URL — controller sends it back to frontend
    return { profileImage: url };
  }
}