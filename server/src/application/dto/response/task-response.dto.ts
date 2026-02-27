export interface TaskResponseDTO {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  estimatedMinutes?: number;
  isCompleted: boolean;
  xpReward: number;
  createdAt: Date;
}
