import type { BuddyProfileRequestDTO } from "../../../dto/request/buddyProfile-request.dto.js";

export interface ISaveBuddyProfileUsecase {
  execute(userId: string, data: BuddyProfileRequestDTO): Promise<void>;
}
