import mongoose, { Document, Model } from 'mongoose';
import { BuddyPreferenceSchema } from '../schema/buddy-preferance.schema';
import type {
  StudyGoal,
  StudyFrequency,
  SubjectDomain,
  Availability,
  SessionDuration,
  FocusLevel,
  StudyPreference,
  GroupStudy,
  StudyMode,
} from '../../../domain/enums/buddy.enums';

export interface BuddyPreferenceDocument extends Document {
  userId:          mongoose.Types.ObjectId;
  country:         string;
  studyGoal:       StudyGoal;
  studyLanguage:   string;
  frequency:       StudyFrequency;
  isVisible:       boolean;
  lastActiveAt:    Date | null;
  // premium fields — null when not set
  subjectDomain:   SubjectDomain | null;
  availability:    Availability | null;
  sessionDuration: SessionDuration | null;
  focusLevel:      FocusLevel | null;
  studyPreference: StudyPreference | null;
  groupStudy:      GroupStudy | null;
  studyMode:       StudyMode | null;
  createdAt:       Date;
  updatedAt:       Date;
}

export const BuddyPreferenceModel: Model<BuddyPreferenceDocument> =
  mongoose.models.BuddyPreference ||
  mongoose.model<BuddyPreferenceDocument>('BuddyPreference', BuddyPreferenceSchema);