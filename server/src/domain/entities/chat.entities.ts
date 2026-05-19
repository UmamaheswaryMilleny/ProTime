import type { MessageType, MessageStatus } from '../enums/chat.enums';



export interface ConversationEntity {
    id: string;
    buddyConnectionId: string; 
    user1Id: string;  
    user2Id: string; 
    lastMessageAt?: Date;     
    lastMessageBy?: string;  
    createdAt: Date;
    updatedAt: Date;
}


// Represents a single message in a 1:1 conversation.
// senderId is null for SYSTEM messages (e.g. "Pomodoro started").
// content is always a non-empty string — system messages have generated text.
// sessionId optionally tags a message to a shared pomodoro session.
export interface DirectMessageEntity {
    id: string;
    conversationId: string;
    senderId: string | null;  // null for SYSTEM messages like Pomodoro started
    content: string;        
    messageType: MessageType;
    status: MessageStatus;
    readAt?: Date;         
    sessionId?: string;         
    fileUrl?: string;             // Cloudinary URL for images/files
    fileName?: string;          
    fileSize?: number;        
    fileType?: string;            
    createdAt: Date;
    updatedAt: Date;
}



export interface ChatSessionEntity {
    id: string;
    conversationId: string;
    startedBy: string;
    durationMinutes: number;  
    startedAt: Date;   
    endedAt?: Date;     
    pausedAt?: Date;     
    pomodorosCompleted: number;   // how many pomodoros completed this session
    controlledBy?: string;
    createdAt: Date;
    updatedAt: Date;
}