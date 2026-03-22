export enum MessageType {
    TEXT = 'TEXT',
    SYSTEM = 'SYSTEM',
}

export enum MessageStatus {
    SENT = 'SENT',       // saved to DB
    DELIVERED = 'DELIVERED',  // receiver online, received via socket
    READ = 'READ',       // receiver opened the chat
}