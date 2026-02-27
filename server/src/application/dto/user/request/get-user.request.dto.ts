import { IsOptional, IsInt, Min, IsString, IsEnum } from "class-validator";
import { Type } from "class-transformer";

export enum UserStatusFilter {
  ALL = "all",
  BLOCKED = "blocked",
  UNBLOCKED = "unblocked",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export class GetUsersRequestDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserStatusFilter, {
    message: "Status must be one of: all, blocked, unblocked",
  })
  status?: UserStatusFilter = UserStatusFilter.ALL;

  @IsOptional()
  @IsString()
  sort?: string = "createdAt";

  @IsOptional()
  @IsEnum(SortOrder, {
    message: "Order must be one of: asc, desc",
  })
  order?: SortOrder = SortOrder.ASC;
}



