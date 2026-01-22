import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  IsUrl,
  Validate,
} from "class-validator";
import { Transform } from "class-transformer";
import { MatchPasswordConstraint } from "./password-validator.js";

export class RegisterRequestDTO {
  @IsString()
  @IsNotEmpty({ message: "First name is required" })
  @MinLength(2, { message: "First name must be at least 2 characters" })
  @Matches(/^[A-Za-z]+$/, {
    message: "First name must contain only letters",
  })
  @Transform(({ value }) => value?.trim())
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: "Last name is required" })
  @MinLength(2, { message: "Last name must be at least 2 characters" })
  @Matches(/^[A-Za-z]+$/, {
    message: "Last name must contain only letters",
  })
  @Transform(({ value }) => value?.trim())
  lastName!: string;

  @IsEmail({}, { message: "Invalid email format" })
  email!: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @Matches(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  @Matches(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  @Matches(/[0-9]/, {
    message: "Password must contain at least one number",
  })
  @Matches(/[@$!%*?&]/, {
    message: "Password must contain at least one special character",
  })
  password!: string;

  
  @IsString()
  @IsNotEmpty({ message: "Confirm password is required" })
  @Validate(MatchPasswordConstraint)
  confirmPassword!: string;



  @IsEnum(["client", "admin"], {
    message: "Invalid role",
  })
  role!: "client" | "admin";



  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl({}, { message: "Profile image must be a valid URL" })
  profileImage?: string;
}