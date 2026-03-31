import { GetRoomsRequestDTO, GetRoomsResponseDTO } from "../../../dtos/study-room.dto";

export interface IGetRoomsUsecase {
  execute(dto: GetRoomsRequestDTO): Promise<GetRoomsResponseDTO>;
}
