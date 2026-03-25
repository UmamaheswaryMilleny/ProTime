import { injectable } from 'tsyringe';
import { BaseRepository } from '../base.repository';
import { SessionNoteModel, SessionNoteDocument } from '../../database/models/session-note.model';
import { SessionNoteInfraMapper } from '../../database/mappers/session-note.infra.mapper';
import type { ISessionNoteRepository } from '../../../domain/repositories/calendar/session-not.repository.interface';
import type { SessionNoteEntity }      from '../../../domain/entities/calender.entities';

@injectable()
export class SessionNoteRepository
  extends BaseRepository<SessionNoteDocument, SessionNoteEntity>
  implements ISessionNoteRepository
{
  constructor() {
    super(SessionNoteModel, SessionNoteInfraMapper.toDomain);
  }

  async findBySessionAndUser(
    sessionId: string,
    userId:    string,
  ): Promise<SessionNoteEntity | null> {
    const doc = await SessionNoteModel.findOne({ sessionId, userId }).lean();
    if (!doc) return null;
    return SessionNoteInfraMapper.toDomain(doc as SessionNoteDocument);
  }

  async updateContent(
    noteId:  string,
    content: string,
  ): Promise<SessionNoteEntity | null> {
    const doc = await SessionNoteModel.findByIdAndUpdate(
      noteId,
      { $set: { content } },
      { new: true },
    ).lean();
    if (!doc) return null;
    return SessionNoteInfraMapper.toDomain(doc as SessionNoteDocument);
  }
}
