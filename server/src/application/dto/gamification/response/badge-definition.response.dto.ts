import { BadgeCategory } from "../../../../domain/enums/gamification.enums";

// shows all available badges
export interface BadgeDefinitionResponseDTO {
  id: string;
  key: string;
  name: string;
  description: string;
  iconUrl?: string;
  category: BadgeCategory;
  conditionType: string; //eg complete 10podoro or focus time this minutes
  conditionValue: number; //like 10 pomodoro or 120 focus minutes
  xpReward: number;
  premiumRequired: boolean;
}