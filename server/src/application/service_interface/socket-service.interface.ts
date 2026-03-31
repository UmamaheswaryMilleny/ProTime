
import { CommunityChatResponseDTO } from "../dto/community-chat/response/community-chat.response.dto";


export interface ISocketService {
  emitNewMessage(message: CommunityChatResponseDTO): void;
  emitToUser(userId: string, event: string, data: unknown): void;
  emitToConversation(conversationId: string, event: string, data: unknown): void;
  emitToRoom?(roomId: string, event: string, data: unknown): void;
  isUserOnline(userId: string): boolean;
  setUserOnline(userId: string, socketId: string): void;
  setUserOffline(userId: string): void;
  setActiveRoom(userId: string, conversationId: string): void;
  clearActiveRoom(userId: string): void;
  getActiveRoom(userId: string): string | undefined;
}