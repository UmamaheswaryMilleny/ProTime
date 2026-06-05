import { inject, injectable } from 'tsyringe';
import type { IRateBuddyUsecase } from '../../interface/buddy-match/rate-buddy.usecase.interface';
import type { IBuddyConnectionRepository } from '../../../../domain/repositories/buddy/buddy.connection.repository.interface';
import {
  BuddyNotFoundError,
  BuddyRatingRangeError,
  DuplicateBuddyRatingError,
  BuddyRatingUpdateError,
} from '../../../../domain/errors/buddy.errors';
import { BuddyMapper } from '../../../mapper/buddy.mapper';

@injectable()
export class RateBuddyUsecase implements IRateBuddyUsecase {
  constructor(
    @inject('IBuddyConnectionRepository')
    private readonly buddyConnectionRepo: IBuddyConnectionRepository,
  ) {}

  /**
   * Records a rating for a completed session.
   * The rating is stored on the BuddyConnection entity.
   * Returns the updated average rating and total rating count of the rated user.
   */
  async execute(connectionId: string, rating: number, raterId: string): Promise<{ averageRating: number; ratingCount: number }> {
    if (rating < 1 || rating > 5) {
      throw new BuddyRatingRangeError();
    }

    // Fetch the connection to ensure it exists
    const connection = await this.buddyConnectionRepo.findById(connectionId);
    if (!connection) {
      throw new BuddyNotFoundError();
    }

    // Prevent duplicate ratings for the same session/connection
    const hasRated = connection.ratedUserIds?.includes(raterId) || 
                     connection.ratings?.some(r => r.raterId === raterId);
    if (hasRated) {
      throw new DuplicateBuddyRatingError();
    }

    // Prepare updated ratings list and calculate connection aggregates
    const newRatings = [...(connection.ratings || []), { raterId, rating }];
    const newRatedUserIds = [...(connection.ratedUserIds || []), raterId];
    const newRatingSum = (connection.ratingSum || 0) + rating;
    const newRatingCount = (connection.ratingCount || 0) + 1;
    const newAverageRating = Number((newRatingSum / newRatingCount).toFixed(1));

    const updated = await this.buddyConnectionRepo.updateSessionStats(
      connection.userId,
      connection.buddyId,
      {
        ratingSum: newRatingSum,
        ratingCount: newRatingCount,
        averageRating: newAverageRating,
        ratedUserIds: newRatedUserIds,
        ratings: newRatings,
      },
      connection.id,
    );

    if (!updated) {
      throw new BuddyRatingUpdateError();
    }

    // Determine the user being rated (the other participant)
    const ratedUserId = connection.userId === raterId ? connection.buddyId : connection.userId;

    // Fetch all connections for the rated user to calculate their overall dynamic rating stats
    const allConnections = await this.buddyConnectionRepo.findByUserId(ratedUserId);

    // Calculate dynamic average and count of the rated user
    const userRatingStats = BuddyMapper.calculateUserAverageRating(ratedUserId, allConnections);

    return userRatingStats;
  }
}
