import type { IBaseRepository } from '../base/base.repository.interface';
import type { SessionNoteEntity }  from '../../entities/calender.entities';

export interface ISessionNoteRepository
  extends IBaseRepository<SessionNoteEntity> {

  // Get this user's private note for a session — null if never saved
  findBySessionAndUser(
    sessionId: string,
    userId:    string,
  ): Promise<SessionNoteEntity | null>;

  // Update content if note already exists for this user + session
  updateContent(
    noteId:  string,
    content: string,
  ): Promise<SessionNoteEntity | null>;
}
