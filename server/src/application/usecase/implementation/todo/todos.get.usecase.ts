import { inject, injectable } from 'tsyringe';
import type { IGetTodosUsecase } from '../../interface/todo/todos-get.usecase.interface';
import type { ITodoRepository } from '../../../../domain/repositories/todo/todo.repository.interface';
import type { IGamificationRepository } from '../../../../domain/repositories/gamification/gamification.repository.interface';
import type { TodoListResponseDTO } from '../../../dto/todo/response/todolist-response.dto';
import { TodoMapper } from '../../../mapper/todo.mapper';

@injectable()
export class GetTodosUsecase implements IGetTodosUsecase {
  constructor(
    @inject('ITodoRepository')
    private readonly todoRepository: ITodoRepository,

    @inject('IGamificationRepository')
    private readonly gamificationRepository: IGamificationRepository,
  ) { }

  async execute(
    userId: string,
    // if does not pass a filter, it defaults to 'all' 
    filter: 'all' | 'pending' | 'completed' | 'expired' = 'all',
  ): Promise<TodoListResponseDTO> {
    // 1. Fetch todos
    const todos = await this.todoRepository.findByUserId(userId, filter);

    // 2. Get today's XP from gamification 
    //    Fallback to 0 if no gamification doc yet new user)
    const gamification = await this.gamificationRepository.findByUserId(userId);
    const todayXp = gamification?.dailyXpEarned ?? 0;

    return TodoMapper.toListResponse(todos, todayXp);
  }
}
