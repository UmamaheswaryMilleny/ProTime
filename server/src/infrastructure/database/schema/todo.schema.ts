import { Schema, Types } from "mongoose";
import { PomodoroStatus, TodoPriority, TodoStatus } from "../../../domain/enums/todo.enums";

export const TodoSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: null,
      maxlength: 1000,
    },
    priority: {
      type: String,
      enum: Object.values(TodoPriority),
      required: true,
      index: true,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    estimatedTime: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TodoStatus),
      default: TodoStatus.PENDING,
      index: true,
    },


    pomodoroEnabled: {
      type: Boolean,
      default: false,
    },
    pomodoroCompleted: {
      type: Boolean,
      default: false,
    },
    actualPomodoroTime: {
      type: Number,
      default: null,
    },
    smartBreaks: {
      type: Boolean,
      default: null,
    },
    pomodoroStatus: {
      type: String,
      enum: Object.values(PomodoroStatus),
      default: PomodoroStatus.IDLE,
    },
    lastPausedAt: {
      type: Date,
      default: null,
    },


    baseXp: {
      type: Number,
      required: true,
      default: 0,
    },
    bonusXp: {
      type: Number,
      default: 0,
    },

    xpCounted: {
      type: Boolean,
      default: false,
    },


    isShared: {
      type: Boolean,
      default: false,
    },
    sharedWith: {
      type: [Types.ObjectId],
      ref: "User",
      default: [],
    },


    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Compound index for getTotalXpEarnedToday query ───────────────────────────
// userId + completedAt + xpCounted — used in aggregation to sum daily XP
TodoSchema.index({ userId: 1, completedAt: 1, xpCounted: 1 });