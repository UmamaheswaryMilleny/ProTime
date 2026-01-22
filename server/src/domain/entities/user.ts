export interface IUserEntity {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio?: string;
  location?: string;
  profileImage?: string;
  role: "client" | "admin";
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
