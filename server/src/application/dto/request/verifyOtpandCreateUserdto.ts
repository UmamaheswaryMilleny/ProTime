import { IsEmail, IsString } from "class-validator";

export class VerifyOtpAndCreateUserDTO {
  @IsEmail()
  email!: string;

  @IsString()
  otp!: string;

  userData!: any;
}