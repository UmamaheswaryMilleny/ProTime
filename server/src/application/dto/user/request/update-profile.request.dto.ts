import {
  IsString,
  IsOptional,
  MaxLength,
} from "class-validator";

export class UpdateProfileRequestDTO {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

    @IsOptional()
  @IsString()
  country?: string;


  @IsOptional()
  @IsString()
  profileImage?: string; 
}