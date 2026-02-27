
import type { IBadgeEntity } from "../../entities/badge.entity.js";

export interface IBadgeRepository {
  findByName(name: string): Promise<IBadgeEntity | null>;

  findAll(): Promise<IBadgeEntity[]>;
}
