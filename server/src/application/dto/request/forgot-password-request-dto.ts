import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from "class-validator";

export class ForgotPasswordRequestDTO {
  @IsEmail({}, { message: "Invalid email format" })
  @IsNotEmpty({ message: "Email is required" })
  email!: string;

  @IsOptional()
  @IsEnum(["client", "admin"], {
    message: "Invalid role. Must be one of: client, admin",
  })
  role?: "client" | "admin";
}
