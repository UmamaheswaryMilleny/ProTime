export interface BuddyMatchResponseDTO {
  id: string;
  requesterId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  matchedAt?: Date;
}
