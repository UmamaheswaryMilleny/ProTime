import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SaveSessionNotesRequestDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;
}
