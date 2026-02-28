import type { TodoResponseDTO } from "../../../dto/todo/response/todo.response.dto.js";

export interface ICompletePomodoroUsecase{
    execute(userId:string,todoId:string,actualPomodoroTime?:number):Promise<TodoResponseDTO>
}