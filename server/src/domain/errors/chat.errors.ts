import { DomainError } from './base-domain.error';

// ─── 404 ──────────────────────────────────────────────────────────────────────
export class ConversationNotFoundError extends DomainError {
    constructor() {
        super('Conversation not found');
    }
}

export class MessageNotFoundError extends DomainError {
    constructor() {
        super('Message not found');
    }
}

// ─── 403 ──────────────────────────────────────────────────────────────────────
// Users are not CONNECTED buddies — chat not allowed
export class NotABuddyError extends DomainError {
    constructor() {
        super('You can only chat with connected buddies');
    }
}

// Sender is not part of this conversation
export class UnauthorizedMessageError extends DomainError {
    constructor() {
        super('You are not authorized to send messages in this conversation');
    }
}

// ─── 400 ──────────────────────────────────────────────────────────────────────
// Pomodoro already running in this chat room
export class SessionAlreadyActiveError extends DomainError {
    constructor() {
        super('A pomodoro session is already active in this chat');
    }
}

// Trying to end or pause a session that is not running
export class SessionNotActiveError extends DomainError {
    constructor() {
        super('No active pomodoro session in this chat');
    }
}