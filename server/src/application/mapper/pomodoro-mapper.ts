import type { IPomodoroSessionEntity } from "../../domain/entities/pomodoro-session.entity.js";
import type { PomodoroResponseDTO } from "../dto/response/pomodoro-response-dto.js";

export class PomodoroMapper {
  static toResponseDTO(session: IPomodoroSessionEntity): PomodoroResponseDTO {
    return {
      id: session._id,
      durationMinutes: session.focusDuration,
      status: session.status,
      xpEarned: session.xpEarned,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    };
  }
}
