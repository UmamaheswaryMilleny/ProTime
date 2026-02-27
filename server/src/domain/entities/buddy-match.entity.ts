export type BuddyMatchStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

export interface IBuddyMatchEntity {
  _id: string;

  requesterId: string;
  receiverId: string;

  status: BuddyMatchStatus;

  matchedAt?: Date;

  createdAt: Date;
}
