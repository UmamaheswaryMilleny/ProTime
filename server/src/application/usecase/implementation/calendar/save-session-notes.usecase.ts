import { inject, injectable } from 'tsyringe';
import type { ISaveSessionNotesUsecase } from '../../interface/calendar/save-session-notes.usecase.interface';
// import type { ISessionNoteRepository } from '../../../../domain/repositories/calendar/session-note.repository.interface';
import type { ISessionNoteRepository } from '../../../../domain/repositories/calendar/session-not.repository.interface';
import type { IBuddySessionRepository } from '../../../../domain/repositories/calendar/buddy-session.repository.interface';
import type { SaveSessionNotesRequestDTO } from '../../../dto/calendar/request/save-session-notes.request.dto';
import type { SessionNoteResponseDTO } from '../../../dto/calendar/response/session-note.response.dto';
import { SessionNotFoundError, UnauthorizedSessionActionError } from '../../../../domain/errors/calendar.error';
import { CalendarMapper } from '../../../mapper/calendar.mapper';

@injectable()
export class SaveSessionNotesUsecase implements ISaveSessionNotesUsecase {
  constructor(
    @inject('ISessionNoteRepository')
    private readonly noteRepo: ISessionNoteRepository,

    @inject('IBuddySessionRepository')
    private readonly sessionRepo: IBuddySessionRepository,
  ) {}

  async execute(
    userId:    string,
    sessionId: string,
    dto:       SaveSessionNotesRequestDTO,
  ): Promise<SessionNoteResponseDTO> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new SessionNotFoundError();

    const isParticipant = session.initiatorId === userId || session.participantId === userId;
    if (!isParticipant) throw new UnauthorizedSessionActionError();

    const note = await this.noteRepo.save({
      sessionId,
      userId,
      content:     dto.content,
    });

    return CalendarMapper.noteToResponse(note);
  }
}
