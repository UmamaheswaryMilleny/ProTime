export interface ChatSessionResponseDTO {
    id: string;
    conversationId: string;
    startedBy: string;
    startedByName: string;
    durationMinutes: number;
    startedAt: Date;
    endedAt?: Date;
    pausedAt?: Date;
    pomodorosCompleted: number;
    controlledBy?: string;
    createdAt: Date;
    updatedAt: Date;
}