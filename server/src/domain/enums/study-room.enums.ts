export enum RoomType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

export enum RoomStatus {
  WAITING = 'WAITING',
  LIVE = 'LIVE',
  ENDED = 'ENDED'
}

export enum RoomFeature {
  CHAT = 'CHAT',
  VIDEO = 'VIDEO',
  POMODORO = 'POMODORO'
}

export enum JoinRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  INVITED = 'INVITED'
}

export enum LevelRequired {
  ANY = 'ANY',
  EARLY_BIRD = 'EARLY_BIRD',
  BEGINNER = 'BEGINNER',
  LEARNER = 'LEARNER',
  EXPLORER = 'EXPLORER',
  ACHIEVER = 'ACHIEVER',
  EXPERT = 'EXPERT',
  PRODIGY = 'PRODIGY',
  MASTER = 'MASTER'
}
