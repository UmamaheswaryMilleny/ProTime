import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginRequestDTO {
  @IsEmail({}, { message: "Invalid email format" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Password is required" })
  password!: string;
}
