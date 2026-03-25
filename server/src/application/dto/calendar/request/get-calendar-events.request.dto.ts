import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class GetCalendarEventsRequestDTO {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'from must be in YYYY-MM-DD format' })
  from!: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'to must be in YYYY-MM-DD format' })
  to!: string; // YYYY-MM-DD
}
