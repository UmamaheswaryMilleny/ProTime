import { IsInt, IsOptional, Min } from 'class-validator';

export class CompletePomodoroRequestDTO {
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Actual Pomodoro time must be at least 1 minute' })
  actualPomodoroTime?: number;
}
