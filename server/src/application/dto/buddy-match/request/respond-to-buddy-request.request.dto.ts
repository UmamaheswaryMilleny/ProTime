import { IsIn } from 'class-validator';

export class RespondToBuddyRequestDTO {
  @IsIn(['ACCEPT', 'DECLINE'])
  action!: 'ACCEPT' | 'DECLINE';
}
