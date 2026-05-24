import { inject, injectable } from 'tsyringe';
import type { IGetTodosUsecase } from '../../interface/todo/todos-get.usecase.interface';
import type { ITodoRepository } from '../../../../domain/repositories/todo/todo.repository.interface';
import type { IGamificationRepository } from '../../../../domain/repositories/gamification/gamification.repository.interface';
import type { TodoListResponseDTO } from '../../../dto/todo/response/todolist-response.dto';
import { TodoMapper } from '../../../mapper/todo.mapper';
import { TodoStatus } from '../../../../domain/enums/todo.enums';

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
    page?: number,
    limit?: number,
  ): Promise<TodoListResponseDTO> {
    // 1. Fetch all user's todos for statistics calculation
    const allTodos = await this.todoRepository.findByUserId(userId, 'all');

    // 2. Fetch paginated/filtered todos
    const paginatedTodos = await this.todoRepository.findByUserId(userId, filter, page, limit);

    // 3. Count total matching tasks for pagination metadata
    let totalItems = 0;
    if (filter === 'all') {
      totalItems = allTodos.length;
    } else {
      const statusMatch =
        filter === 'completed' ? TodoStatus.COMPLETED
        : filter === 'pending' ? TodoStatus.PENDING
        : TodoStatus.EXPIRED;
      totalItems = allTodos.filter(t => t.status === statusMatch).length;
    }

    // 4. Get today's XP from gamification 
    //    Fallback to 0 if no gamification doc yet new user)
    const gamification = await this.gamificationRepository.findByUserId(userId);
    const todayXp = gamification?.dailyXpEarned ?? 0;

    // Create the base response with paginated todos and stats
    const response = TodoMapper.toListResponse(paginatedTodos, todayXp);
    
    // Override the stats using allTodos so they are correct!
    const totalTasks = allTodos.length;
    const completed = allTodos.filter(t => t.status === TodoStatus.COMPLETED).length;
    const shared = allTodos.filter(t => t.sharedWith.length > 0).length;
    const expired = allTodos.filter(t => t.status === TodoStatus.EXPIRED).length;
    const progress = totalTasks === 0 ? 0 : Math.round((completed / totalTasks) * 100);

    response.totalTasks = totalTasks;
    response.completed = completed;
    response.shared = shared;
    response.progress = progress;
    response.expired = expired;

    // Add pagination metadata
    const activePage = page ?? 1;
    const activeLimit = limit ?? paginatedTodos.length; // if no limit, it returned all
    response.pagination = {
      totalItems,
      totalPages: activeLimit > 0 ? Math.ceil(totalItems / activeLimit) : 1,
      currentPage: activePage,
      limit: activeLimit,
    };

    return response;
  }
}
