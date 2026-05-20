export enum MessageType {
    TEXT = 'TEXT',
    SYSTEM = 'SYSTEM',
    IMAGE = 'IMAGE',
    FILE = 'FILE',
    // AI = 'AI',
}

export enum MessageStatus {
    SENT = 'SENT',       // saved to DB
    DELIVERED = 'DELIVERED',  // receiver online, received via socket
    READ = 'READ',       // receiver opened the chat
}