export interface StudyRoomMessageEntity {
  id: string;
  roomId: string;
  senderId: string;
  content?: string;
  fileUrl?: string; // URL of the uploaded file
  fileType?: string; // MIME type or category (image, document, etc.)
  createdAt: Date;
  updatedAt: Date;
}
