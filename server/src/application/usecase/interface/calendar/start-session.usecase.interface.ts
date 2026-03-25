import type { BuddySessionResponseDTO } from '../../../dto/calendar/response/buddy-session.response.dto';

export interface IStartSessionUsecase {
  execute(
    initiatorId:    string,
    conversationId: string,
  ): Promise<BuddySessionResponseDTO>;
}
