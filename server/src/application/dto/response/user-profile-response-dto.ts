export class UserProfileResponseDTO {
  id!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  bio?: string;
  location?: string;
  profileImage?: string;
  role!: "client" |  "admin";
  createdAt!: Date;
}