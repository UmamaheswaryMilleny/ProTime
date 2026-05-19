export interface StudyRoomMessageEntity {
  id: string;
  roomId: string;
  senderId: string;
  content?: string;
  fileUrl?: string; 
  fileType?: string; 
  createdAt: Date;
  updatedAt: Date;
}
