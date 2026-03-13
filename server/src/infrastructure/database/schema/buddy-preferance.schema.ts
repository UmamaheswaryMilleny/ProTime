import mongoose, { Schema } from 'mongoose';
import {
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

export const BuddyPreferenceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one preference document per user
    },

    // ─── Free fields ──────────────────────────────────────────────────────
    timeZone: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    studyGoal: {
      type: String,
      enum: Object.values(StudyGoal),
      required: true,
    },

    studyLanguage: {
      type: String,
      required: true,
    },

    frequency: {
      type: String,
      enum: Object.values(StudyFrequency),
      required: true,
    },

    bio: {
      type: String,
      default: null,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },

    // Updated on every pomodoro completion — drives activity sort in matching
    lastActiveAt: {
      type: Date,
      default: null,
    },

    // ─── Premium fields — all optional, default null ───────────────────────
    subjectDomain: {
      type: String,
      enum: [...Object.values(SubjectDomain), null],
      default: null,
    },

    availability: {
      type: String,
      enum: [...Object.values(Availability), null],
      default: null,
    },

    sessionDuration: {
      type: String,
      enum: [...Object.values(SessionDuration), null],
      default: null,
    },

    focusLevel: {
      type: String,
      enum: [...Object.values(FocusLevel), null],
      default: null,
    },

    studyPreference: {
      type: String,
      enum: [...Object.values(StudyPreference), null],
      default: null,
    },

    groupStudy: {
      type: String,
      enum: [...Object.values(GroupStudy), null],
      default: null,
    },

    studyMode: {
      type: String,
      enum: [...Object.values(StudyMode), null],
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Free matching query — studyGoal + country + visible, sorted by activity
BuddyPreferenceSchema.index(
  { studyGoal: 1, country: 1, isVisible: 1, lastActiveAt: -1 },
);

// Premium matching query — all advanced filter fields
BuddyPreferenceSchema.index(
  {
    studyGoal: 1,
    country: 1,
    subjectDomain: 1,
    availability: 1,
    sessionDuration: 1,
    focusLevel: 1,
    studyPreference: 1,
    isVisible: 1,
    lastActiveAt: -1,
  },
);