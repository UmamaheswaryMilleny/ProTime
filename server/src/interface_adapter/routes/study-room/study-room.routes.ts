import { injectable } from 'tsyringe';
import { container } from 'tsyringe';

import { BaseRoute } from '../base-route';
import { asyncHandler } from '../../../shared/asyncHandler';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import { verifyAuth, authorizeRole } from '../../middlewares/auth.middleware';
import { BlockedUserMiddleware } from '../../middlewares/blocked-user.middleware';
import { StudyRoomController } from '../../controllers/study-room/study-room.controller';
import { UserRole } from '../../../domain/enums/user.enums';
import { ROUTES } from '../../../shared/constants/constants.routes';
import { CreateRoomRequestDTO, RespondToJoinRequestDTO, SendStudyRoomMessageDTO } from '../../../application/dtos/study-room.dto';

@injectable()
export class StudyRoomRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    const ctrl = container.resolve(StudyRoomController);
    const blockedMiddleware = container.resolve(BlockedUserMiddleware);

    this.router.use(verifyAuth);
    this.router.use(authorizeRole([UserRole.CLIENT]));
    this.router.use(
      asyncHandler(blockedMiddleware.checkBlockedUser.bind(blockedMiddleware)),
    );

    this.router.post(
      ROUTES.ROOMS.ROOT,
      validationMiddleware(CreateRoomRequestDTO),
      asyncHandler(ctrl.createRoom.bind(ctrl))
    );

    this.router.get(
      ROUTES.ROOMS.ROOT,
      asyncHandler(ctrl.getRooms.bind(ctrl))
    );

    this.router.get(
      ROUTES.ROOMS.MY,
      asyncHandler(ctrl.getMyRooms.bind(ctrl))
    );

    this.router.get(
      ROUTES.ROOMS.ALL_REQUESTS,
      asyncHandler(ctrl.getAllRequests.bind(ctrl))
    );

    this.router.get(
      ROUTES.ROOMS.BY_ID,
      asyncHandler(ctrl.getRoomById.bind(ctrl))
    );

    this.router.post(
      ROUTES.ROOMS.JOIN,
      asyncHandler(ctrl.joinRoom.bind(ctrl))
    );

    this.router.post(
      ROUTES.ROOMS.REQUEST,
      asyncHandler(ctrl.requestToJoin.bind(ctrl))
    );

    this.router.get(
      ROUTES.ROOMS.REQUESTS,
      asyncHandler(ctrl.getPendingRequests.bind(ctrl))
    );

    this.router.patch(
      ROUTES.ROOMS.RESPOND_REQUEST,
      validationMiddleware(RespondToJoinRequestDTO),
      asyncHandler(ctrl.respondToRequest.bind(ctrl))
    );

    this.router.post(
      ROUTES.ROOMS.LEAVE,
      asyncHandler(ctrl.leaveRoom.bind(ctrl))
    );

    this.router.post(
      ROUTES.ROOMS.END,
      asyncHandler(ctrl.endRoom.bind(ctrl))
    );

    this.router.get(
      ROUTES.ROOMS.MESSAGES,
      asyncHandler(ctrl.getMessages.bind(ctrl))
    );

    this.router.post(
      ROUTES.ROOMS.SEND_MESSAGE,
      validationMiddleware(SendStudyRoomMessageDTO),
      asyncHandler(ctrl.sendMessage.bind(ctrl))
    );
  }
}
