import mongoose, { Document, Model } from 'mongoose';
import { SessionNoteSchema } from '../schema/ssession-note.schema';

export interface SessionNoteDocument extends Document {
  sessionId: mongoose.Types.ObjectId;
  userId:    mongoose.Types.ObjectId;
  content:   string;
  createdAt: Date;
  updatedAt: Date;
}

export const SessionNoteModel: Model<SessionNoteDocument> =
  mongoose.models.SessionNote ||
  mongoose.model<SessionNoteDocument>('SessionNote', SessionNoteSchema);
