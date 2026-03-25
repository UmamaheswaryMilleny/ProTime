import { inject, injectable } from 'tsyringe';
import type { INotificationService, InAppNotification } from '../../application/service_interface/notification-service.interface';
import type { ISocketService } from '../../application/service_interface/socket-service.interface';

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject('ISocketService')
    private readonly socketService: ISocketService
  ) {}

  notifyUser(userId: string, notification: InAppNotification): void {
    // We use the existing emitToUser from SocketIOService
    this.socketService.emitToUser(userId, 'notification:new', notification);
  }
}
