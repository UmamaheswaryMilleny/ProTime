import { Types } from 'mongoose';
import type { TodoEntity } from '../../../domain/entities/todo.entity';
import type { TodoDocument } from '../models/todo.model';

export class TodoMapper {
  // ─── Document → Domain Entity ─────────────────────────────────────────────
  static toDomain(doc: TodoDocument): TodoEntity {
    return {
      id: (doc._id as { toString(): string }).toString(),
      userId: doc.userId.toString(),
      title: doc.title,
      description: doc.description ?? undefined,
      priority: doc.priority,
      estimatedTime: doc.estimatedTime,
      status: doc.status,

      pomodoroEnabled: doc.pomodoroEnabled,
      pomodoroCompleted: doc.pomodoroCompleted,
      actualPomodoroTime: doc.actualPomodoroTime ?? undefined,
      smartBreaks: doc.smartBreaks ?? undefined,

      baseXp: doc.baseXp,
      bonusXp: doc.bonusXp,
      xpCounted: doc.xpCounted,

      isShared: doc.isShared,
      // sharedWith is ObjectId[] in DB — convert to string[] for domain
      sharedWith: doc.sharedWith.map((id) => id.toString()),

      completedAt: doc.completedAt ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  // ─── Partial Entity → Persistence Object ──────────────────────────────────
  static toPersistence(data: Partial<TodoEntity>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (data.userId !== undefined) result.userId = data.userId;
    if (data.title !== undefined) result.title = data.title;
    if (data.description !== undefined) result.description = data.description;
    if (data.priority !== undefined) result.priority = data.priority;
    if (data.estimatedTime !== undefined) result.estimatedTime = data.estimatedTime;
    if (data.status !== undefined) result.status = data.status;

    if (data.pomodoroEnabled !== undefined) result.pomodoroEnabled = data.pomodoroEnabled;
    if (data.pomodoroCompleted !== undefined) result.pomodoroCompleted = data.pomodoroCompleted;
    if (data.actualPomodoroTime !== undefined) result.actualPomodoroTime = data.actualPomodoroTime;
    if (data.smartBreaks !== undefined) result.smartBreaks = data.smartBreaks;

    if (data.baseXp !== undefined) result.baseXp = data.baseXp;
    if (data.bonusXp !== undefined) result.bonusXp = data.bonusXp;
    if (data.xpCounted !== undefined) result.xpCounted = data.xpCounted;

    if (data.isShared !== undefined) result.isShared = data.isShared;

    // ✅ Bug 3 fix — domain holds string[], schema expects ObjectId[]
    if (data.sharedWith !== undefined) {
      result.sharedWith = data.sharedWith.map((id) => new Types.ObjectId(id));
    }

    if (data.completedAt !== undefined) result.completedAt = data.completedAt;

    return result;
  }
}