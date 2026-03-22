import { IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetChatMessagesRequestDTO {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit: number = 50;

    @IsOptional()
    @IsDateString()
    before?: string; // ISO string cursor
}