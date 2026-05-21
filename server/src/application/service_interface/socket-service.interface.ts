
import { CommunityChatResponseDTO } from "../dto/community-chat/response/community-chat.response.dto";


export interface ISocketService {
  emitNewMessage(message: CommunityChatResponseDTO): void;
  //for notification
  emitToUser(userId: string, event: string, data: unknown): void;
  //direct chat
  emitToConversation(conversationId: string, event: string, data: unknown): void;
  emitToRoom?(roomId: string, event: string, data: unknown): void;
  isUserOnline(userId: string): boolean;
  setUserOnline(userId: string, socketId: string): void;

  //Unregisters the user when they close the app or log out.
  setUserOffline(userId: string): void;

  //If I am already inside Chat A, don't show me a "New Message" popup for Chat A. 
  // But if a message comes for Chat B (which I'm not looking at), show me a notification.

  setActiveRoom(userId: string, conversationId: string): void;
  clearActiveRoom(userId: string): void;
  getActiveRoom(userId: string): string | undefined;
  disconnectUser(userId: string): void;
}