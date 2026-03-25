import { IsString, IsNotEmpty, IsArray, IsNumber, Min } from 'class-validator';

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
}
