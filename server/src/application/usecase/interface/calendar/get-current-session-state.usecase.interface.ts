import type { BuddySessionResponseDTO } from '../../../dto/calendar/response/buddy-session.response.dto';

export interface CurrentSessionStateResponseDTO {
  active: BuddySessionResponseDTO | null;
  planned: BuddySessionResponseDTO | null;
}

export interface IGetCurrentSessionStateUsecase {
  execute(conversationId: string): Promise<CurrentSessionStateResponseDTO>;
}
