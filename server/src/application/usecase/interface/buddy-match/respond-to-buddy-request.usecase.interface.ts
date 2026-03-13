import type { RespondToBuddyRequestDTO } from "../../../dto/buddy-match/request/respond-to-buddy-request.request.dto";

export interface IRespondToBuddyRequestUsecase {
  execute(
    receiverId:   string,
    connectionId: string,
    dto:          RespondToBuddyRequestDTO,
  ): Promise<void>;
}