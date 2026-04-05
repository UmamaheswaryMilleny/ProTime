import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { MessageType } from '../../../../domain/enums/chat.enums';

export class SendDirectMessageRequestDTO {
    @IsString()
    @MaxLength(1000)
    content!: string;

    @IsOptional()
    @IsEnum(MessageType)
    messageType?: MessageType;

    @IsOptional()
    @IsString()
    fileUrl?: string;

    @IsOptional()
    @IsString()
    fileName?: string;

    @IsOptional()
    fileSize?: number;

    @IsOptional()
    @IsString()
    fileType?: string;
}