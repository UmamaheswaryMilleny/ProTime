import { PomodoroStatus, TodoPriority, TodoStatus } from "../../../../domain/enums/todo.enums";

import { AwardXpResponseDTO } from "../../gamification/response/award-xp.response.dto";

//single todo respose returned on create, update, and inside the list response

export interface TodoResponseDTO{
    id:string;
    title:string;
    description:string | null;
    priority:TodoPriority;
    estimatedTime:number;
    status:TodoStatus

    pomodoroEnabled:boolean;
    pomodoroCompleted:boolean;
    actualPomodoroTime:number|null;
    pomodoroStatus?: PomodoroStatus;
    lastPausedAt?: string | null;
    // breakTime:number|undefined;
    smartBreaks: boolean | null;
    baseXp:number;
    bonusXp:number;
    xpCounted: boolean;
    expiryDate: string | null;

    // isShared:boolean;
    sharedWith:string[];

    completedAt:string|null;
    createdAt:string;
    updatedAt:string;
}

export interface CompleteTodoResponseDTO {
    todo: TodoResponseDTO;
    xpResult: AwardXpResponseDTO;
}

