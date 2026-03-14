import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SendMessageRequestDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content!: string;
}