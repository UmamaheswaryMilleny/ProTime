export interface IGetGamificationOverviewUsecase {
  execute(): Promise<any>;
}

export interface IGetUsersProgressUsecase {
  execute(params: any): Promise<any>;
}

export interface IGetGamificationUserDetailUsecase {
  execute(userId: string): Promise<any>;
}

export interface IGetGamificationLeaderboardUsecase {
  execute(params: any): Promise<any>;
}

export interface IGetBadgesGridUsecase {
  execute(): Promise<any>;
}

export interface IToggleBadgeUsecase {
  execute(badgeId: string): Promise<void>;
}

export interface ICreateBadgeUsecase {
  execute(data: any): Promise<any>;
}

export interface IUpdateBadgeUsecase {
  execute(badgeId: string, data: any): Promise<any>;
}

export interface IDeleteBadgeUsecase {
  execute(badgeId: string): Promise<void>;
}

