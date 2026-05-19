import type { IBaseRepository } from '../base/base.repository.interface';
import type { ChatSessionEntity } from '../../entities/chat.entities';

export interface IChatSessionRepository
    extends IBaseRepository<ChatSessionEntity> {


    findActiveByConversationId(
        conversationId: string,
    ): Promise<ChatSessionEntity | null>;


    endSession(
        sessionId: string,
        endedAt: Date,
    ): Promise<ChatSessionEntity | null>;

    
    updatePomodoroState(
        sessionId: string,
        data: Partial<Pick<ChatSessionEntity,
            | 'pausedAt'
            | 'pomodorosCompleted'
            | 'controlledBy'
        >>,
    ): Promise<ChatSessionEntity | null>;
}