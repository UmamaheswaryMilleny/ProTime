import type { ISubscriptionEntity } from "../../domain/entities/subscription.entity.js";
import type { SubscriptionResponseDTO } from "../dto/response/subscription-response-dto.js";

export class SubscriptionMapper {
  static toResponseDTO(sub: ISubscriptionEntity): SubscriptionResponseDTO {
    return {
      type: sub.type,
      isActive: sub.isActive,
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt,
    };
  }
}
