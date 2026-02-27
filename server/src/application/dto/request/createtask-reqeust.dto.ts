import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt, Min } from "class-validator";

export class CreateTaskRequestDTO {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(["low", "medium", "high"])
  priority!: "low" | "medium" | "high";

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedMinutes?: number;
}
