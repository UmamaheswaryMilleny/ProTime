import { IsString, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class RateBuddyRequestDTO {
  @IsString()
  @IsNotEmpty()
  sessionId!: string; // BuddyConnection ID

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}
