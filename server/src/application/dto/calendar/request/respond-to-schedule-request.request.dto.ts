import { IsEnum, IsNotEmpty } from 'class-validator';
import { ScheduleConfirmStatus } from '../../../../domain/enums/calendar.enums';

export class RespondToScheduleRequestDTO {
  @IsEnum(ScheduleConfirmStatus)
  @IsNotEmpty()
  status!: ScheduleConfirmStatus.CONFIRMED | ScheduleConfirmStatus.REJECTED;
}
