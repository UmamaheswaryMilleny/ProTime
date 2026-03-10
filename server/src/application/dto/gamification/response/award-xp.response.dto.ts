import { LevelTitle } from "../../../../domain/enums/gamification.enums";
import { UserBadgeResponseDTO } from "./user-badge.response.dto";

//returned instantly after an action (completing a Pomodoro, sending a chat, etc.) to drive real-time UI feedback.
export interface AwardXpResponseDTO {
  xpAwarded: number; // actual XP credited (0 if daily cap hit)
  totalXp: number; // new total XP
  currentLevel: number; // new level (may have increased)
  currentTitle: LevelTitle; // new title (may have changed)
  leveledUp: boolean; // true if level increased this award
  newBadges: UserBadgeResponseDTO[]; // any badges earned from this action
  streakUpdated: boolean; // true if streak was incremented
  streakBonus: number; // XP from streak milestone (0 if no milestone hit)
  capReached: boolean; // true if daily XP cap was hit
}
