import { injectable, container } from 'tsyringe';
import { ProBuddyController } from '../../controllers/probuddy/probuddy.controller';
import { verifyAuth } from '../../middlewares/auth.middleware';
import { BaseRoute } from '../base-route';

@injectable()
export class ProBuddyRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const controller = container.resolve(ProBuddyController);

    /**
     * @route POST /api/v1/probuddy/chat
     * @desc Interaction with AI assistant
     * @access Private
     */
    this.router.post('/chat', verifyAuth, (req, res) => controller.chat(req, res));
  }
}
