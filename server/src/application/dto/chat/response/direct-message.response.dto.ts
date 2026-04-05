import type { MessageType, MessageStatus } from '../../../../domain/enums/chat.enums';

export interface DirectMessageResponseDTO {
    id: string;
    conversationId: string;
    senderId: string | null;  // null for SYSTEM messages
    fullName: string | null;  // null for SYSTEM messages
    content: string;
    messageType: MessageType;
    status: MessageStatus;
    readAt?: Date;
    sessionId?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    createdAt: Date;
    updatedAt: Date;
}