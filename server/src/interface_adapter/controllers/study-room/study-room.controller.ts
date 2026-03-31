import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";
import type { ICreateRoomUsecase } from "../../../application/usecase/interface/study-room/create-room.usecase.interface";
import type { IJoinRoomUsecase } from "../../../application/usecase/interface/study-room/join-room.usecase.interface";
import type { IRequestToJoinUsecase } from "../../../application/usecase/interface/study-room/request-to-join.usecase.interface";
import type { IRespondToJoinRequestUsecase } from "../../../application/usecase/interface/study-room/respond-to-join-request.usecase.interface";
import type { ILeaveRoomUsecase } from "../../../application/usecase/interface/study-room/leave-room.usecase.interface";
import type { IEndRoomUsecase } from "../../../application/usecase/interface/study-room/end-room.usecase.interface";
import type { IGetRoomsUsecase } from "../../../application/usecase/interface/study-room/get-rooms.usecase.interface";
import type { IGetMyRoomsUsecase } from "../../../application/usecase/interface/study-room/get-my-rooms.usecase.interface";
import type { IGetRoomByIdUsecase } from "../../../application/usecase/interface/study-room/get-room-by-id.usecase.interface";
import type { IGetPendingJoinRequestsUsecase } from "../../../application/usecase/interface/study-room/get-pending-join-requests.usecase.interface";
import type { ISendStudyRoomMessageUsecase } from "../../../application/usecase/interface/study-room/send-study-room-message.usecase.interface";
import type { IGetStudyRoomMessagesUsecase } from "../../../application/usecase/interface/study-room/get-study-room-messages.usecase.interface";
import type { IGetAllRoomRequestsUsecase } from "../../../application/usecase/interface/study-room/get-all-requests.usecase.interface";
import type { IStartRoomUsecase } from "../../../application/usecase/interface/study-room/start-room.usecase.interface";
import type { ICloudinaryService } from "../../../application/service_interface/cloudinary.service.interface";
import { CreateRoomRequestDTO, GetRoomsRequestDTO, RespondToJoinRequestDTO, SendStudyRoomMessageDTO } from "../../../application/dtos/study-room.dto";
import { HTTP_STATUS } from "../../../shared/constants/constants";

@injectable()
export class StudyRoomController {
  constructor(
    @inject('ICreateRoomUsecase') private createRoomUsecase: ICreateRoomUsecase,
    @inject('IJoinRoomUsecase') private joinRoomUsecase: IJoinRoomUsecase,
    @inject('IRequestToJoinUsecase') private requestToJoinUsecase: IRequestToJoinUsecase,
    @inject('IRespondToJoinRequestUsecase') private respondToJoinRequestUsecase: IRespondToJoinRequestUsecase,
    @inject('ILeaveRoomUsecase') private leaveRoomUsecase: ILeaveRoomUsecase,
    @inject('IEndRoomUsecase') private endRoomUsecase: IEndRoomUsecase,
    @inject('IGetRoomsUsecase') private getRoomsUsecase: IGetRoomsUsecase,
    @inject('IGetMyRoomsUsecase') private getMyRoomsUsecase: IGetMyRoomsUsecase,
    @inject('IGetRoomByIdUsecase') private getRoomByIdUsecase: IGetRoomByIdUsecase,
    @inject('IGetPendingJoinRequestsUsecase') private getPendingJoinRequestsUsecase: IGetPendingJoinRequestsUsecase,
    @inject('ISendStudyRoomMessageUsecase') private sendStudyRoomMessageUsecase: ISendStudyRoomMessageUsecase,
    @inject('IGetStudyRoomMessagesUsecase') private getStudyRoomMessagesUsecase: IGetStudyRoomMessagesUsecase,
    @inject('IGetAllRoomRequestsUsecase') private getAllRoomRequestsUsecase: IGetAllRoomRequestsUsecase,
    @inject('IStartRoomUsecase') private startRoomUsecase: IStartRoomUsecase,
    @inject('ICloudinaryService') private cloudinaryService: ICloudinaryService,
  ) {}

  async createRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hostId = (req as any).user.id;
      const dto = req.body as CreateRoomRequestDTO;
      const room = await this.createRoomUsecase.execute(hostId, dto);
      res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Room created', data: room });
    } catch (error) { next(error); }
  }

  async getRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = {
        type: req.query.type,
        status: req.query.status,
        search: req.query.search,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      } as GetRoomsRequestDTO;
      const data = await this.getRoomsUsecase.execute(dto);
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Rooms fetched', data });
    } catch (error) { next(error); }
  }

  async getMyRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hostId = (req as any).user.id;
      const rooms = await this.getMyRoomsUsecase.execute(hostId);
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'My rooms fetched', data: rooms });
    } catch (error) { next(error); }
  }

  async getRoomById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roomId = req.params.roomId as string;
      const room = await this.getRoomByIdUsecase.execute(roomId);
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Room fetched', data: room });
    } catch (error) { next(error); }
  }

  async joinRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const roomId = req.params.roomId as string;
      const updatedRoom = await this.joinRoomUsecase.execute(userId, roomId);
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Joined room successfully', data: updatedRoom });
    } catch (error) { next(error); }
  }

  async requestToJoin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const roomId = req.params.roomId as string;
      const request = await this.requestToJoinUsecase.execute(userId, roomId);
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Join request sent', data: request });
    } catch (error) { next(error); }
  }

  async getPendingRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hostId = (req as any).user.id;
      const roomId = req.params.roomId as string;
      const requests = await this.getPendingJoinRequestsUsecase.execute(hostId, roomId);
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Pending requests fetched', data: requests });
    } catch (error) { next(error); }
  }

  async respondToRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hostId = (req as any).user.id;
      const requestId = req.params.requestId as string;
      const dto = req.body as RespondToJoinRequestDTO;
      const request = await this.respondToJoinRequestUsecase.execute(hostId, requestId, dto);
      res.status(HTTP_STATUS.OK).json({ success: true, message: `Request ${dto.action.toLowerCase()}ed`, data: request });
    } catch (error) { next(error); }
  }

  async leaveRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const roomId = req.params.roomId as string;
      await this.leaveRoomUsecase.execute(userId, roomId);
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Left room successfully' });
    } catch (error) { next(error); }
  }

  async endRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hostId = (req as any).user.id;
      const roomId = req.params.roomId as string;
      await this.endRoomUsecase.execute(hostId, roomId);
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Room ended successfully' });
    } catch (error) { next(error); }
  }

  async startRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hostId = (req as any).user.id;
      const roomId = req.params.roomId as string;
      const room = await this.startRoomUsecase.execute(hostId, roomId);
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Room started successfully', data: room });
    } catch (error) { next(error); }
  }

  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const roomId = req.params.roomId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const data = await this.getStudyRoomMessagesUsecase.execute(userId, roomId, page, limit);
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Messages fetched', data });
    } catch (error) { next(error); }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const roomId = req.params.roomId as string;
      const dto = req.body as SendStudyRoomMessageDTO;

      if (req.file) {
        const folder = `study-rooms/${roomId}/chat`;
        const filename = `${userId}_${Date.now()}`;
        const uploadResult = await this.cloudinaryService.uploadFile(
          req.file.buffer,
          folder,
          filename
        );
        dto.fileUrl = uploadResult.url;
        dto.fileType = req.file.mimetype;
      }

      const data = await this.sendStudyRoomMessageUsecase.execute(userId, roomId, dto);
      res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Message sent', data });
    } catch (error) { next(error); }
  }

  async getAllRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const data = await this.getAllRoomRequestsUsecase.execute(userId);
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Room requests fetched', data });
    } catch (error) { next(error); }
  }
}
