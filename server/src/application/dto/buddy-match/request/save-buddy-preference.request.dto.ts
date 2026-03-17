import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,

  IsNotEmpty,
} from 'class-validator';
import {
  StudyGoal,
  StudyFrequency,
  SubjectDomain,
  Availability,
  SessionDuration,
  FocusLevel,
  StudyPreference,
  GroupStudy,
  StudyMode,
} from '../../../../domain/enums/buddy.enums';

export class SaveBuddyPreferenceRequestDTO {
  // ─── Free fields — required for all users ─────────────────────────────────

  @IsString()
  @IsNotEmpty()
  country!: string;

  @IsEnum(StudyGoal)
  studyGoal!: StudyGoal;

  @IsString()
  @IsNotEmpty()
  studyLanguage!: string;

  @IsEnum(StudyFrequency)
  frequency!: StudyFrequency;

  @IsBoolean()
  isVisible!: boolean;


  // ─── Premium fields — ignored for free users in the usecase ───────────────
  @IsOptional()
  @IsEnum(SubjectDomain)
  subjectDomain?: SubjectDomain;

  @IsOptional()
  @IsEnum(Availability)
  availability?: Availability;

  @IsOptional()
  @IsEnum(SessionDuration)
  sessionDuration?: SessionDuration;

  @IsOptional()
  @IsEnum(FocusLevel)
  focusLevel?: FocusLevel;

  @IsOptional()
  @IsEnum(StudyPreference)
  studyPreference?: StudyPreference;

  @IsOptional()
  @IsEnum(GroupStudy)
  groupStudy?: GroupStudy;

  @IsOptional()
  @IsEnum(StudyMode)
  studyMode?: StudyMode;
}
