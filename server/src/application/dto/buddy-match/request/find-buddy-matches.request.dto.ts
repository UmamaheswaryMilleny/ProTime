import { IsInt, IsOptional, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FindBuddyMatchesRequestDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  // / which page of results to return. Defaults to 1.
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  global?: string;
}
