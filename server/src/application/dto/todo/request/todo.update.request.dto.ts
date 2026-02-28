import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  Min,
  Max,
  ValidateIf,
  MaxLength,
} from 'class-validator';
import {
  TodoPriority,
  BREAK_TIME,
} from '../../../../domain/enums/todo.enums.js';

export class UpdateTodoRequestDTO {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

@IsOptional()
@IsEnum(TodoPriority,{message:"Priority must be LOW, MEDIUM or HIGH"})
priority?:TodoPriority

@IsOptional()
  @IsInt()
  @Min(1)
  estimatedTime?:number;


  @IsOptional()
  @IsBoolean()
  pomodoroEnabled?: boolean;

  @ValidateIf((o) => o.pomodoroEnabled === true)
  @IsOptional()
  @IsInt()
  @Min(BREAK_TIME.MIN_MINUTES, {
    message: `Break time must be at least ${BREAK_TIME.MIN_MINUTES} minutes`,
  })
  @Max(BREAK_TIME.MAX_MINUTES, {
    message: `Break time cannot exceed ${BREAK_TIME.MAX_MINUTES} minutes`,
  })
  breakTime?: number;
}
