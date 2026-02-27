import { IsEnum, IsOptional, IsString, IsInt, Min } from "class-validator";

export class UpdateTaskRequestDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(["low", "medium", "high"])
  priority?: "low" | "medium" | "high";

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedMinutes?: number;
}
