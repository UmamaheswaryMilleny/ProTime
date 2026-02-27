export interface PomodoroResponseDTO {
  id: string;
  durationMinutes: number;
  status: "started" | "paused" | "completed" | "stopped";
  xpEarned: number;
  startedAt: Date;
  endedAt?: Date;
}
