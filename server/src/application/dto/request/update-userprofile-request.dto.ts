import {
  IsString,
  IsOptional,
  MaxLength,
} from "class-validator";

export class UpdateUserProfileRequestDTO {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;



  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  profileImage?: string; 
}