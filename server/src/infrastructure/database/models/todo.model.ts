import mongoose, { Document, Model, Types } from "mongoose";
import { TodoSchema } from "../schema/todo.schema.js";
import { TodoPriority, TodoStatus } from "../../../domain/enums/todo.enums.js";

export interface TodoDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string | null;
  priority: TodoPriority;
  estimatedTime: number;
  status: TodoStatus;

  pomodoroEnabled: boolean;
  pomodoroCompleted: boolean;
  actualPomodoroTime?: number | null;
  breakTime?: number | null;

  baseXp: number;
  bonusXp: number;
  // totalXp: number;    // stored for fast aggregation — baseXp + bonusXp
  xpCounted: boolean;

  isShared: boolean;
  sharedWith: Types.ObjectId[];

  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const TodoModel: Model<TodoDocument> =
  mongoose.models.Todo ||
  mongoose.model<TodoDocument>("Todo", TodoSchema);