// Interface for rating a buddy after a call
export interface IRateBuddyUsecase {
  /**
   * Rate a completed session between two users.
   * @param connectionId - the BuddyConnection ID (session identifier)
   * @param rating - integer 1-5 stars given by the rating user
   * @returns the updated average rating and total rating count
   */
  execute(connectionId: string, rating: number, raterId: string): Promise<{
    averageRating: number;
    ratingCount: number;
  }>;
}
