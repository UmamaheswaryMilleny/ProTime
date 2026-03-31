export interface StudyRoomMessageEntity {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
