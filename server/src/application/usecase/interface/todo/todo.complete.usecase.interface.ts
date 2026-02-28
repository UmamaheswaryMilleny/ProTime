import type { TodoResponseDTO } from "../../../dto/todo/response/todo.response.dto.js";

export interface ICompleteTodoUsecase{
    execute(userId:string,todoId:string):Promise<TodoResponseDTO>
}