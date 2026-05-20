import mongoose, { Document, Model } from 'mongoose';
import { SkillSchema } from '../schema/skill.schema';

export interface SkillDocument extends Document {
  name: string;
  category: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const SkillModel: Model<SkillDocument> =
  mongoose.models.Skill ||
  mongoose.model<SkillDocument>('Skill', SkillSchema);
