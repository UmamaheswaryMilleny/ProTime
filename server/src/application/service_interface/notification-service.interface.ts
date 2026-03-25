
export enum NotificationType {
  BUDDY_REQUEST = 'buddy_request',
  BUDDY_ACCEPTED = 'buddy_accepted',
  TASK_EXPIRED = 'task_expired',
  XP_GAINED = 'xp_gained',
  LEVEL_UP = 'level_up',
  TASK_COMPLETED = 'task_completed',
  PREMIUM_PURCHASED = 'premium_purchased',
  SCHEDULE_ACCEPTED = 'schedule_accepted',
  SESSION_REMINDER = 'session_reminder',
}

export interface InAppNotification {
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface INotificationService {
  notifyUser(userId: string, notification: InAppNotification): void;
}
