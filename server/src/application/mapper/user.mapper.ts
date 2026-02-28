import type { UserEntity } from "../../domain/entities/user.entity";
import type { UserResponseDTO ,PaginatedUsersResponseDTO} from "../dto/user/response/user.response.dto";

//use cases like get users admin list users or any usecase returning user info needs it
export class UserMapper {
  static toUserResponse(user: UserEntity): UserResponseDTO {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
static toPaginatedResponse(
  users: UserEntity[],
  meta: { total: number; page: number; limit: number }
): PaginatedUsersResponseDTO {
  const totalPages = Math.ceil(meta.total / meta.limit);

  return {
    users: users.map(this.toUserResponse),
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
    totalPages,
  };
}


}


