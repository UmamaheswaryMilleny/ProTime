import { GetRoomsRequestDTO, GetRoomsResponseDTO } from  "../../../dto/study-room/request/study-room.dto";

export interface IGetRoomsUsecase {
  execute(dto: GetRoomsRequestDTO): Promise<GetRoomsResponseDTO>;
}
