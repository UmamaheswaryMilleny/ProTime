import type { BuddySessionResponseDTO } from '../../../dto/calendar/response/buddy-session.response.dto';

export interface IEndSessionUsecase {
  execute(
    userId:         string,
    conversationId: string,
  ): Promise<BuddySessionResponseDTO>;
}
