export interface SessionNoteResponseDTO {
  id:        string;
  sessionId: string;
  userId:    string;
  content:   string;
  tags?:     string[];
  createdAt: Date;
  updatedAt: Date;
}
