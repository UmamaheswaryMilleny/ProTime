import { LevelTitle } from "../../../../domain/enums/gamification.enums";

// Returned when profile is first created on signup
export interface InitializeGamificationResponseDTO {
  userId: string;
  totalXp: number; // always 0
  currentLevel: number; // always 0
  currentTitle: LevelTitle; // always EARLY_BIRD
  createdAt: string;
}

