export interface IBuddyProfileEntity {
  _id: string;

  userId: string;

  studyGoals: string[]; // Technology, GATE, etc.
  subjects: string[];   // Web Dev, ML, etc.

  timezone: string;

  availability: "morning" | "afternoon" | "evening" | "night";

  studyDurationMinutes: number; // 25, 50, etc.

  focusLevel: "casual" | "moderate" | "high";

  studyPreference: "chat" | "video" | "both";

  groupStudy: boolean;

  createdAt: Date;
  updatedAt: Date;
}
