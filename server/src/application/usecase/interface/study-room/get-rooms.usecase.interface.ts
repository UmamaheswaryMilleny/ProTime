import { GetRoomsRequestDTO, GetRoomsResponseDTO } from "../../../dto/study-room/study-room.dto";

export interface IGetRoomsUsecase {
  execute(dto: GetRoomsRequestDTO): Promise<GetRoomsResponseDTO>;
}
