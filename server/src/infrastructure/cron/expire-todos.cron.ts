import cron from 'node-cron';
import { container } from 'tsyringe';
import type { IExpireTodosUsecase } from '../../application/usecase/interface/todo/expire-todos.usecase.interface';
import { logger } from '../config/logger.config';

export const startExpireTodosCron = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const usecase = container.resolve<IExpireTodosUsecase>('IExpireTodosUsecase');
      await usecase.execute();
    } catch (error) {
      logger.error('Error in ExpireTodosCron:', error);
    }
  });
};
