import mongoose, { Document, Model } from 'mongoose';
import { PlanSchema } from '../schema/plan.schema';

export interface PlanDocument extends Document {
  name: string;
  code: string;
  price: number;
  features: string[];
  stripePriceId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const PlanModel: Model<PlanDocument> = mongoose.model<PlanDocument>(
  'Plan',
  PlanSchema
);
