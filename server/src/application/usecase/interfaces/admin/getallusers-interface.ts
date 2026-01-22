import type { PaginatedUsersResponseDTO } from "../../../dto/response/user-response-dto.js";
import { UserStatusFilter, SortOrder } from "../../../dto/request/get-user-request-dto.js";

export interface IGetAllUsersUsecase {
  execute(
    page: number,
    limit: number,
    search?: string,
    status?: UserStatusFilter,
    sort?: string,
    order?: SortOrder
  ): Promise<PaginatedUsersResponseDTO>;
}