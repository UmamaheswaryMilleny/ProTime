import { IsString,IsNotEmpty,IsOptional,IsEnum,IsInt,IsBoolean,IsDateString,MaxLength,Min,Max,ValidateIf, isInt } from "class-validator";
import { TodoPriority} from "../../../../domain/enums/todo.enums";

export class CreateTodoRequestDTO{
  @IsString()
  @IsNotEmpty({message:'Title is required'})
  @MaxLength(200)
  title!:string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?:string;

  @IsEnum(TodoPriority,{message:'Priority must be LOW, MEDIUM or HIGH'})
  priority!:TodoPriority;

  @IsInt()
  @Min(1)
  estimatedTime!:number;

  @IsBoolean()
  pomodoroEnabled!:boolean;
  // @ValidateIf((o)=>o.pomodoroEnabled===true)
  // @IsOptional()
  // @IsInt()
  // @Min(BREAK_TIME.MIN_MINUTES,{message:`Break time must be at least ${BREAK_TIME.MIN_MINUTES} minutes`})
  // @Max(BREAK_TIME.MAX_MINUTES,{message:`Break time cannot exceed ${BREAK_TIME.MAX_MINUTES} minutes`})
  // breakTime?:number
      @IsOptional()
    @IsBoolean()
    smartBreaks?: boolean;
}