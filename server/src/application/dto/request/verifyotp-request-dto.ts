import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class VerifyOtpRequestDTO {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  otp!: string;
}