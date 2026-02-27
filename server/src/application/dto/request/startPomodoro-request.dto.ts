import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class StartPomodoroRequestDTO {
  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @IsOptional()
  @IsString()
  taskId?: string;
}
