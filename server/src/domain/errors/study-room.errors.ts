import { DomainError } from "./base-domain.error";

export class RoomNotFoundError extends DomainError {
  constructor() {
    super('Study room not found.');
  }
}

export class RoomFullError extends DomainError {
  constructor() {
    super('Study room is full.');
  }
}

export class RoomAlreadyJoinedError extends DomainError {
  constructor() {
    super('You have already joined this study room.');
  }
}

export class RoomNotLiveError extends DomainError {
  constructor() {
    super('This study room is no longer active.');
  }
}

export class UnauthorizedRoomActionError extends DomainError {
  constructor() {
    super('You do not have permission to perform this action.');
  }
}

export class JoinRequestNotFoundError extends DomainError {
  constructor() {
    super('Join request not found.');
  }
}

export class JoinRequestAlreadyRespondedError extends DomainError {
  constructor() {
    super('This join request has already been responded to.');
  }
}

export class AlreadyRequestedError extends DomainError {
  constructor() {
    super('You already have a pending join request for this room.');
  }
}
