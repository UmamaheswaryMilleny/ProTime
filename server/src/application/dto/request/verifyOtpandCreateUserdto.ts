import { IsEmail, IsString } from "class-validator";

export class VerifyOtpAndCreateUserDTO {
  @IsEmail()
  email!: string;

  @IsString()
  otp!: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData!: any;
}