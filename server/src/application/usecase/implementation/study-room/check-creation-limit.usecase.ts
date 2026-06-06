import { inject, injectable } from "tsyringe";
import type { ICheckCreationLimitUsecase } from "../../interface/study-room/check-creation-limit.usecase.interface";
import { StudyRoomLimitResponseDTO } from "../../../dtos/study-room.dto";
import type { IStudyRoomRepository } from "../../../../domain/repositories/study-room/study-room.repository.interface";
import type { IUserRepository } from "../../../../domain/repositories/user/user.repository.interface";

@injectable()
export class CheckCreationLimitUsecase implements ICheckCreationLimitUsecase {
  constructor(
    @inject('IStudyRoomRepository') private studyRoomRepo: IStudyRoomRepository,
    @inject('IUserRepository') private userRepo: IUserRepository,
  ) {}

  async execute(userId: string): Promise<StudyRoomLimitResponseDTO> {
    const user = await this.userRepo.findById(userId);
    const isPremium = !!user?.isPremium;

    // Premium users have unlimited room creation
    if (isPremium) {
      return {
        count: 0,
        limit: Infinity,
        isLimitReached: false,
        isPremium: true
      };
    }

    // Free users: limit is 5 rooms per calendar month
    const limit = 1;
    const now = new Date();
    const startOfMonth = new Date(now.getDay());
    const endOfMonth = new Date(now.getDay());

    const count = await this.studyRoomRepo.countCreatedByHostInMonth(userId, startOfMonth, endOfMonth);

    return {
      count,
      limit,
      isLimitReached: count >= limit,
      isPremium: false
    };
  }
}
