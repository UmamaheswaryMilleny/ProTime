import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SendDirectMessageRequestDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    content!: string;
}