export interface ConversationResponseDTO {
    id: string;
    buddyConnectionId: string;
    otherUser: {
        userId: string;
        fullName: string;
    };
    lastMessageAt?: Date;
    lastMessageBy?: string;
    lastMessageByName?: string;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}