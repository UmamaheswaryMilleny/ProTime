export interface XpTransactionResponseDTO {
  id: string;
  source: "TASK" | "POMODORO" | "STREAK" | "BADGE";
  xpAmount: number;
  createdAt: Date;
}
