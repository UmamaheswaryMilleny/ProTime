import type { MessageType, MessageStatus } from '../enums/chat.enums';

// ─── ConversationEntity ───────────────────────────────────────────────────────
// Auto-created when two users become CONNECTED buddies.
// user1Id is always the lexicographically smaller userId — prevents duplicate rooms.
// unread counts removed — derived via countUnread() on IDirectMessageRepository.
export interface ConversationEntity {
    id: string;
    buddyConnectionId: string;   // links to BuddyConnectionEntity that created this
    user1Id: string;   // lexicographically smaller userId
    user2Id: string;   // lexicographically larger userId
    lastMessageAt?: Date;     // for sorting chat list newest first
    lastMessageBy?: string;   // userId of last sender — for "Alex: ..." preview
    createdAt: Date;
    updatedAt: Date;
}

// ─── DirectMessageEntity ─────────────────────────────────────────────────────
// Represents a single message in a 1:1 conversation.
// senderId is null for SYSTEM messages (e.g. "Pomodoro started").
// content is always a non-empty string — system messages have generated text.
// sessionId optionally tags a message to a shared pomodoro session.
export interface DirectMessageEntity {
    id: string;
    conversationId: string;
    senderId: string | null;  // null for SYSTEM messages
    content: string;         // always has text — never empty
    messageType: MessageType;
    status: MessageStatus;
    readAt?: Date;           // set when receiver reads the message
    sessionId?: string;         // tags message to a shared pomodoro session
    fileUrl?: string;             // Cloudinary URL for images/files
    fileName?: string;            // Original filename
    fileSize?: number;            // Size in bytes
    fileType?: string;            // Mimetype (e.g. image/png, application/pdf)
    createdAt: Date;
    updatedAt: Date;
}

// ─── ChatSessionEntity ────────────────────────────────────────────────────────
// Represents a shared pomodoro session inside a 1:1 chat room.
// isActive is derived — session is active when endedAt is null/undefined.
// controlledBy tracks who last touched the timer.
// pausedAt tracks when current pause started — enforces 15 min pause limit.
export interface ChatSessionEntity {
    id: string;
    conversationId: string;
    startedBy: string;   // userId who started the timer
    durationMinutes: number;   // 25 | 45 | 60 | 120
    startedAt: Date;     // server timestamp — both clients sync to this
    endedAt?: Date;     // set when timer ends or stopped early
    pausedAt?: Date;     // set when paused — cleared on resume
    pomodorosCompleted: number;   // how many pomodoros completed this session
    controlledBy?: string;   // userId who last touched the timer
    createdAt: Date;
    updatedAt: Date;
}