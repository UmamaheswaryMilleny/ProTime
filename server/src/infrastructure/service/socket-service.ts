import type { Server } from 'socket.io';
import type { ISocketService } from '../../application/service_interface/socket-service.interface';
import type { CommunityChatResponseDTO } from '../../application/dto/community-chat/response/community-chat.response.dto';

export class SocketIOService implements ISocketService {
  private readonly io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  // Broadcast new message to ALL connected clients
  emitNewMessage(message: CommunityChatResponseDTO): void {
    this.io.emit('community:new-message', message);
  }
}