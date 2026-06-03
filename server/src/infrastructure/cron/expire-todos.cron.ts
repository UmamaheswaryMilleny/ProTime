import cron from 'node-cron';
import { container } from 'tsyringe';
import type { IExpireTodosUsecase } from '../../application/usecase/interface/todo/expire-todos.usecase.interface';
import { logger } from '../config/logger.config';

export const startExpireTodosCron = () => {
  cron.schedule('* * * * *', async () => {
    try {
      logger.info('[ExpireTodosCron] Running...');

      const usecase = container.resolve<IExpireTodosUsecase>(
        'IExpireTodosUsecase'
      );

      await usecase.execute();

      logger.info('[ExpireTodosCron] Completed');
    } catch (error: unknown) {
      logger.error('Error in ExpireTodosCron:', error);
    }
  });
};
