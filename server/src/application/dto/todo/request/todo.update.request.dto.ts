import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  Min,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { TodoPriority } from '../../../../domain/enums/todo.enums';

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
  @IsDateString()
  expiryDate?: string;
  @IsOptional()
  @IsEnum(TodoPriority, { message: 'Priority must be LOW, MEDIUM or HIGH' })
  priority?: TodoPriority;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedTime?: number;

  @IsOptional()
  @IsBoolean()
  pomodoroEnabled?: boolean;
  @IsOptional()
  @IsBoolean()
  smartBreaks?: boolean;

}
