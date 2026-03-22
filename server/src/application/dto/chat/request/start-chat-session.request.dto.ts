import { IsIn } from 'class-validator';

export class StartChatSessionRequestDTO {
    @IsIn([25, 45, 60, 120])
    durationMinutes!: number;
}