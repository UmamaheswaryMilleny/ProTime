import { TodoResponseDTO } from "./todo.response.dto";
export interface TodoListResponseDTO{
    todos:TodoResponseDTO[];
    totalTasks:number;
    completed:number;
    expired: number;
    shared:number;
    progress:number; // 0–100, calculated as Math.round((completed / totalTasks) * 100)
    todayXp: number;  //XP earned today for the daily cap progress bar
    dailyXpCap: number;// always 50, frontend uses this to render bar
}