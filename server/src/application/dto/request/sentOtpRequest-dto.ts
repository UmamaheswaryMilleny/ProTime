import { IsEmail, IsNotEmpty, Matches } from "class-validator";

export class SendOtpRequestDTO {
  @IsEmail({}, { message: "Invalid email address" })
  email!: string;

}