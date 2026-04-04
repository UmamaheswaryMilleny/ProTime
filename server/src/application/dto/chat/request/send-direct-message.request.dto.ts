import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { MessageType } from '../../../../domain/enums/chat.enums';

export class SendDirectMessageRequestDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    content!: string;

    @IsOptional()
    @IsEnum(MessageType)
    messageType?: MessageType;
}