import { IsNotEmpty, IsString } from "class-validator";

export class VerifyResetTokenRequestDTO {
  @IsString()
  @IsNotEmpty({ message: "Token is required" })
  token!: string;
}
