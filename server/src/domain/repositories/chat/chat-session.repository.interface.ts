import type { IBaseRepository } from '../base/base.repository.interface';
import type { ChatSessionEntity } from '../../entities/chat.entities';

export interface IChatSessionRepository
    extends IBaseRepository<ChatSessionEntity> {

    // Check if a session is currently active in this conversation
    // Active = endedAt is null
    findActiveByConversationId(
        conversationId: string,
    ): Promise<ChatSessionEntity | null>;

    // End session — sets endedAt timestamp
    endSession(
        sessionId: string,
        endedAt: Date,
    ): Promise<ChatSessionEntity | null>;

    // Update pause/resume state and pomodoro progress
    updatePomodoroState(
        sessionId: string,
        data: Partial<Pick<ChatSessionEntity,
            | 'pausedAt'
            | 'pomodorosCompleted'
            | 'controlledBy'
        >>,
    ): Promise<ChatSessionEntity | null>;
}