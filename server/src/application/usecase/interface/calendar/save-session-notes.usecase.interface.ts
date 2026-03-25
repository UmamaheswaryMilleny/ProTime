import type { SaveSessionNotesRequestDTO } from '../../../dto/calendar/request/save-session-notes.request.dto';
import type { SessionNoteResponseDTO }     from '../../../dto/calendar/response/session-note.response.dto';

// Returns SessionNoteResponseDTO — notes are on SessionNoteEntity not BuddySessionEntity
export interface ISaveSessionNotesUsecase {
  execute(
    userId:    string,
    sessionId: string,
    dto:       SaveSessionNotesRequestDTO,
  ): Promise<SessionNoteResponseDTO>;
}
