import { IsString, IsNotEmpty, IsArray, IsNumber, Min, IsOptional } from 'class-validator';

export class ProposeRecurringSessionRequestDTO {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  days!: string[]; // e.g., ['Monday', 'Thursday']

  @IsString()
  @IsNotEmpty()
  startTime!: string; // 'HH:mm'

  @IsString()
  @IsNotEmpty()
  endTime!: string; // 'HH:mm'

  @IsNumber()
  @Min(1)
  noOfSessions!: number;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  dates?: string[]; // Optional: explicitly provided YYYY-MM-DD dates from client
}
