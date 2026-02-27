//returning updated profile
export class UserProfileResponseDTO {
  id!: string;
  fullName!: string;
  email!: string;
  bio?: string;
  country?: string;
  profileImage?: string;
  createdAt!: Date;
}