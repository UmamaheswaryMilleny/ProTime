//returning updated profile
export interface UserProfileResponseDTO {
  id: string;
  fullName: string;
  email: string;
  username:string;
  bio?: string;
  country?: string;
  profileImage?: string;
  languages?:string[];
  createdAt: string;
}

