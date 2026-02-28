import type { UpdateTodoRequestDTO } from "../../../dto/todo/request/todo.update.request.dto.js";
import type { TodoResponseDTO } from "../../../dto/todo/response/todo.response.dto.js";

export interface IUpdateTodoUsecase{
    execute(userId:string,todoId:string,data:UpdateTodoRequestDTO):Promise<TodoResponseDTO>
}