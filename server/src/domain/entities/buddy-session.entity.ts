export interface IBuddySessionEntity {
  _id: string;

  userId: string;
  buddyId: string;

  durationMinutes: number;

  rating: number; // 1–5 stars

  createdAt: Date;
}
