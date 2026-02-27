import { IsNotEmpty, IsString } from "class-validator";

export class GoogleAuthRequestDTO {
  @IsString()
  @IsNotEmpty({ message: "Google ID token is required" })
  idToken!: string;
  
}
