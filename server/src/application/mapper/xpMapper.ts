
import type { IXpTransactionEntity } from "../../domain/entities/xp-transaction.entity.js"
import type { XpTransactionResponseDTO } from "../dto/response/xpTransaction-response.dto.js";

export class XpMapper {
  static toResponseDTO(xp: IXpTransactionEntity): XpTransactionResponseDTO {
    return {
      id: xp._id,
      source: xp.source,
      xpAmount: xp.xpAmount,
      createdAt: xp.createdAt,
    };
  }
}
