import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  Validate,
} from "class-validator";
import { Transform } from "class-transformer";
import { MatchPasswordConstraint } from "./password-validator.js";

export class RegisterRequestDTO {
  @IsString()
  @IsNotEmpty({ message: "Fullname is required" })
  @MinLength(2, { message: "Fullname must be at least 2 characters" })
@Matches(/^[A-Za-z\s]+$/, {  
    message: "Fullname must contain only letters",
  })
  @Transform(({ value }) => value?.trim())
  fullName!: string;



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




}