import { inject, injectable } from "tsyringe";
import type { ICreateSoloEventUsecase } from "../../interface/calendar/create-solo-event.usecase.interface";
import type { ICalendarEventRepository } from "../../../../domain/repositories/calendar/calendar-event.repository.interface";
import { CalendarEventType } from "../../../../domain/enums/calendar.enums";

@injectable()
export class CreateSoloEventUsecase implements ICreateSoloEventUsecase {
  constructor(
    @inject("ICalendarEventRepository")
    private readonly calendarRepo: ICalendarEventRepository,
  ) {}

  async execute(
    userId: string,
    title: string,
    date: string,
    startTime: string
  ): Promise<any> {
    const event = await this.calendarRepo.save({
      userId,
      type: CalendarEventType.TASK, // Representing a solo task/session
      date,
      startTime,
      title,
    });
    
    // We mock the response to match CalendarEvent interface on the frontend
    return {
      id: event.id,
      type: event.type,
      date: event.date,
      startTime: event.startTime,
      title: event.title,
    };
  }
}
