import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class ProposeNextSessionRequestDTO {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledAt!: string;
}
