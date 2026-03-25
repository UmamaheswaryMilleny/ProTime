import type { 
  BuddySessionEntity, 
  SessionNoteEntity, 
  CalendarEventEntity, 
  SessionScheduleRequestEntity 
} from '../../domain/entities/calender.entities';
import type { BuddySessionResponseDTO }     from '../dto/calendar/response/buddy-session.response.dto';
import type { SessionNoteResponseDTO }      from '../dto/calendar/response/session-note.response.dto';
import type { CalendarEventResponseDTO }   from '../dto/calendar/response/calendar-event.response.dto';
import type { SessionScheduleRequestResponseDTO } from '../dto/calendar/response/session-schedule-request.response.dto';

export class CalendarMapper {
  static sessionToResponse(entity: BuddySessionEntity): BuddySessionResponseDTO {
    return {
      id:                entity.id,
      conversationId:    entity.conversationId,
      buddyConnectionId: entity.buddyConnectionId,
      initiatorId:       entity.initiatorId,
      participantId:     entity.participantId,
      status:            entity.status,
      startedAt:         entity.startedAt,
      endedAt:           entity.endedAt,
      scheduledAt:       entity.scheduledAt,
      roomId:            entity.roomId,
      createdAt:         entity.createdAt,
      updatedAt:         entity.updatedAt,
    };
  }

  static noteToResponse(entity: SessionNoteEntity): SessionNoteResponseDTO {
    return {
      id:        entity.id,
      sessionId: entity.sessionId,
      userId:    entity.userId,
      content:   entity.content,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static scheduleRequestToResponse(
    entity:       SessionScheduleRequestEntity,
    proposerName: string,
  ): SessionScheduleRequestResponseDTO {
    return {
      id:              entity.id,
      sessionId:       entity.sessionId,
      proposedBy:      entity.proposedBy,
      proposedTo:      entity.proposedTo,
      scheduledAt:     entity.scheduledAt,
      recurringDates:  entity.recurringDates,
      durationMinutes: entity.durationMinutes,
      status:          entity.confirmStatus,
      proposerName:    proposerName,
      expiresAt:       entity.expiresAt,
      respondedAt:     entity.respondedAt,
      createdAt:       entity.createdAt,
      updatedAt:       entity.updatedAt,
    };
  }

  static eventToResponse(
    entity:  CalendarEventEntity,
    session?: BuddySessionResponseDTO,
    note?:    SessionNoteResponseDTO,
  ): CalendarEventResponseDTO {
    return {
      id:         entity.id,
      userId:     entity.userId,
      type:       entity.type,
      date:       entity.date,
      title:      entity.title,
      startTime:  entity.startTime,
      session,
      note,
      createdAt:  entity.createdAt,
      updatedAt:  entity.updatedAt,
    };
  }
}
