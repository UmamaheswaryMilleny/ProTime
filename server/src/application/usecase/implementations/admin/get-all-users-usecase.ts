import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../../../domain/repositoryInterface/user/user-repository-interface.js";
import type { IGetAllUsersUsecase } from "../../interfaces/admin/getallusers-interface.js";
import type { PaginatedUsersResponseDTO } from "../../../dto/response/user-response-dto.js";
import { UserMapper } from "../../../mapper/user-mapper.js";
import { UserStatusFilter, SortOrder } from "../../../dto/request/get-user-request-dto.js";

@injectable()
export class GetAllUsersUsecase implements IGetAllUsersUsecase {
  constructor(
    @inject("IUserRepository")
    private _userRepository: IUserRepository
  ) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status: UserStatusFilter = UserStatusFilter.ALL,
    sort: string = "createdAt",
    order: SortOrder = SortOrder.ASC
  ): Promise<PaginatedUsersResponseDTO> {
    // Convert enum to string literal for repository
    const statusFilter: "all" | "blocked" | "unblocked" =
      status === UserStatusFilter.ALL
        ? "all"
        : status === UserStatusFilter.BLOCKED
        ? "blocked"
        : "unblocked";

    const sortOrder: "asc" | "desc" =
      order === SortOrder.ASC ? "asc" : "desc";

    const { users, total } = await this._userRepository.findAllWithSearch(
      page,
      limit,
      search,
      statusFilter,
      sort,
      sortOrder
    );
    // This line calculates how many pages you need for pagination.
    // Math.ceil rounds UP(go to the next bigger whole number) to the nearest whole number.

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map((user) => UserMapper.toUserResponseDto(user)),
      total,
      page,
      limit,
      totalPages,
    };
  }
}