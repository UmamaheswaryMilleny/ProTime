import { TodoPriority,TodoStatus } from "../../../../domain/enums/todo.enums";

//single todo respose returned on create, update, and inside the list response

export interface TodoResponseDTO{
    id:string;
    title:string;
    description:string|undefined;
    priority:TodoPriority;
    estimatedTime:number;
    status:TodoStatus

    pomodoroEnabled:boolean;
    pomodoroCompleted:boolean;
    actualPomodoroTime:number|undefined;
    // breakTime:number|undefined;
    smartBreaks: boolean | undefined;
    baseXp:number;
    bonusXp:number;
    xpCounted: boolean;
    

    isShared:boolean;
    sharedWith:string[];

    completedAt:string|null;
    createdAt:string;
    updatedAt:string;
}

export interface TodoListResponseDTO{
    todos:TodoResponseDTO[];
    totalTasks:number;
    completed:number;
    shared:number;
    progress:number; // 0–100, calculated as Math.round((completed / totalTasks) * 100)
    todayXp: number;  //XP earned today for the daily cap progress bar
    dailyXpCap: number;// always 50, frontend uses this to render bar
}