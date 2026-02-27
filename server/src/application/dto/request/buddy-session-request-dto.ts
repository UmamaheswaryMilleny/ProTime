import { IsInt, IsString, Max, Min } from "class-validator";

export class BuddySessionRequestDTO {
  @IsString()
  buddyId!: string;

  @IsInt()
  @Min(30)
  durationMinutes!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}
