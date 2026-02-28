import { Schema, Types } from "mongoose";
import { TodoPriority, TodoStatus } from "../../../domain/enums/todo.enums.js";

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

    // ─── Pomodoro ──────────────────────────────────────────────────────────────
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
      // null for LOW tasks — MEDIUM and HIGH evaluate this flag
    },

    // ─── XP ────────────────────────────────────────────────────────────────────
    baseXp: {
      type: Number,
      required: true,
      default: 0,
    },
    bonusXp: {
      type: Number,
      default: 0,
    },
    // Stored for fast aggregation in getTotalXpEarnedToday ($sum query)
    // Computed as baseXp + bonusXp when task is completed
    // totalXp: {
    //   type: Number,
    //   default: 0,
    // },
    xpCounted: {
      type: Boolean,
      default: false,
    },

    // ─── Sharing ───────────────────────────────────────────────────────────────
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedWith: {
      type: [Types.ObjectId],
      ref: "User",
      default: [],
    },

    // ─── Timestamps ────────────────────────────────────────────────────────────
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