import type { IBaseRepository } from '../base/base.repository.interface';
import type { SessionNoteEntity }  from '../../entities/calender.entities';

export interface ISessionNoteRepository
  extends IBaseRepository<SessionNoteEntity> {


  findBySessionAndUser(
    sessionId: string,
    userId:    string,
  ): Promise<SessionNoteEntity | null>;


  updateContent(
    noteId:  string,
    content: string,
  ): Promise<SessionNoteEntity | null>;
}
