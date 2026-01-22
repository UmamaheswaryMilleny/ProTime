export interface LoginResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "client" | "admin";
  profileImage?: string; 
}