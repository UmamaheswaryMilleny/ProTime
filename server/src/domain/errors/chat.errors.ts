import { DomainError } from './base-domain.error';


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


export class NotABuddyError extends DomainError {
    constructor() {
        super('You can only chat with connected buddies');
    }
}


export class UnauthorizedMessageError extends DomainError {
    constructor() {
        super('You are not authorized to send messages in this conversation');
    }
}


export class SessionAlreadyActiveError extends DomainError {
    constructor() {
        super('A pomodoro session is already active in this chat');
    }
}


export class SessionNotActiveError extends DomainError {
    constructor() {
        super('No active pomodoro session in this chat');
    }
}