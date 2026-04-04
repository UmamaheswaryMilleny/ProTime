import { Schema, Types } from 'mongoose';
import {
  ReportStatus,
  ReportContext,
  ReportReason,
  ReportAction,
} from '../../../domain/enums/report.enums';

export const ReportSchema = new Schema(
  {
    reporterId: {
      type:     Types.ObjectId,
      ref:      'User',
      required: true,
    },

    reportedUserId: {
      type:     Types.ObjectId,
      ref:      'User',
      required: true,
    },

    context: {
      type:     String,
      enum:     Object.values(ReportContext),
      required: true,
    },

    reason: {
      type:     String,
      enum:     Object.values(ReportReason),
      required: true,
    },

    additionalDetails: {
      type:    String,
      default: null,
    },

    screenshots: {
      type:    [String],
      default: [],
    },

    blockUser: {
      type:    Boolean,
      default: false,
    },

    receiveUpdates: {
      type:    Boolean,
      default: false,
    },

    status: {
      type:     String,
      enum:     Object.values(ReportStatus),
      required: true,
      default:  ReportStatus.PENDING,
    },

    // ─── Admin review fields ──────────────────────────────────────────────
    reviewedBy: {
      type:    Types.ObjectId,
      ref:     'User',
      default: null,
    },

    reviewedAt: {
      type:    Date,
      default: null,
    },

    adminNote: {
      type:    String,
      default: null,
    },

    actionTaken: {
      type:    String,
      enum:    [...Object.values(ReportAction), null],
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

// Admin — list all reports filtered by status
ReportSchema.index({ status: 1, createdAt: -1 });

// Duplicate check — find PENDING report by same reporter against same user
ReportSchema.index({ reporterId: 1, reportedUserId: 1, status: 1 });

// Count reports against a user
ReportSchema.index({ reportedUserId: 1 });