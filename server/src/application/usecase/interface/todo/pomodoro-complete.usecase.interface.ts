import type { TodoResponseDTO } from "../../../dto/todo/response/todo.response.dto";

// to know which specific todo's Pomodoro is being completed
export interface ICompletePomodoroUsecase{
    execute(userId:string,todoId:string,actualPomodoroTime?:number):Promise<TodoResponseDTO>
}