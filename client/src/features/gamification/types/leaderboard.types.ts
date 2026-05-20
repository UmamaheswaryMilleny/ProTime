export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  totalXp: number;
  currentLevel: number;
  currentTitle: string;
  currentStreak: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userRank: number;
  userEntry: LeaderboardEntry | null;
}
