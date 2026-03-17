import { DomainError } from './base-domain.error';

export class CommunityMessageLimitError extends DomainError {
  constructor() {
    super('You have reached your monthly community chat limit. Upgrade to Premium for unlimited messages');
  }
}


export class EmptyMessageContentError extends DomainError {
  constructor() {
    super('Message content cannot be empty');
  }
}