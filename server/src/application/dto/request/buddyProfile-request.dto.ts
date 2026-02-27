import { IsArray, IsBoolean, IsEnum, IsInt, IsString, Min } from "class-validator";

export class BuddyProfileRequestDTO {
  @IsArray()
  studyGoals!: string[];

  @IsArray()
  subjects!: string[];

  @IsString()
  timezone!: string;

  @IsEnum(["morning", "afternoon", "evening", "night"])
  availability!: string;

  @IsInt()
  @Min(10)
  studyDurationMinutes!: number;

  @IsEnum(["casual", "moderate", "high"])
  focusLevel!: string;

  @IsEnum(["chat", "video", "both"])
  studyPreference!: string;

  @IsBoolean()
  groupStudy!: boolean;
}
