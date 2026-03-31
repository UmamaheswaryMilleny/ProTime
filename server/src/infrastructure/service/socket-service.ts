import type { Server } from 'socket.io';
import type { ISocketService } from '../../application/service_interface/socket-service.interface';
import type { CommunityChatResponseDTO } from '../../application/dto/community-chat/response/community-chat.response.dto';


export class SocketIOService implements ISocketService {
  private readonly io: Server;
  private readonly onlineUsers: Map<string, string>; // userId → socketId
  private readonly activeRooms: Map<string, string>; // userId → conversationId

  constructor(io: Server) {
    this.io = io;
    this.onlineUsers = new Map();
    this.activeRooms = new Map();
  }

  // Called from server.ts on connect
  setUserOnline(userId: string, socketId: string): void {
    this.onlineUsers.set(userId, socketId);
  }

  // Called from server.ts on disconnect
  setUserOffline(userId: string): void {
    this.onlineUsers.delete(userId);
    this.activeRooms.delete(userId);
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  // Community chat — broadcast to all
  emitNewMessage(message: CommunityChatResponseDTO): void {
    this.io.emit('community:new-message', message);
  }

  // 1:1 chat — send to specific user
  emitToUser(userId: string, event: string, data: unknown): void {
    const socketId = this.onlineUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Session events — emit to all users in a conversation room
  emitToConversation(conversationId: string, event: string, data: unknown): void {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  // Room events — emit to all users in a study room
  emitToRoom(roomId: string, event: string, data: unknown): void {
    this.io.to(`room:${roomId}`).emit(event, data);
  }

  setActiveRoom(userId: string, conversationId: string): void {
    this.activeRooms.set(userId, conversationId);
  }

  clearActiveRoom(userId: string): void {
    this.activeRooms.delete(userId);
  }

  getActiveRoom(userId: string): string | undefined {
    return this.activeRooms.get(userId);
  }
}