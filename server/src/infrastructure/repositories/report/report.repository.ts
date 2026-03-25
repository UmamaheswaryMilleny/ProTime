import { injectable } from 'tsyringe';
import { BaseRepository } from '../base.repository';
import { ReportModel, ReportDocument } from '../../database/models/report.model';
import { ReportInfraMapper } from '../../database/mappers/report.infra.mapper';
import type { IReportRepository } from '../../../domain/repositories/report/report.repository.interface';
import type { ReportEntity }      from '../../../domain/entities/report.entity';
import { ReportStatus } from '../../../domain/enums/report.enums';

@injectable()
export class ReportRepository
  extends BaseRepository<ReportDocument, ReportEntity>
  implements IReportRepository
{
  constructor() {
    super(ReportModel, ReportInfraMapper.toDomain);
  }

  // Admin — paginated list optionally filtered by status
  async findAll(params: {
    status?: ReportStatus;
    page:    number;
    limit:   number;
  }): Promise<{ reports: ReportEntity[]; total: number }> {
    const query: Record<string, unknown> = {};
    if (params.status) query.status = params.status;

    const [docs, total] = await Promise.all([
      ReportModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .lean(),
      ReportModel.countDocuments(query),
    ]);

    return {
      reports: docs.map(d => ReportInfraMapper.toDomain(d as ReportDocument)),
      total,
    };
  }

  // Admin — single report detail
  async findById(id: string): Promise<ReportEntity | null> {
    const doc = await ReportModel.findById(id).lean();
    if (!doc) return null;
    return ReportInfraMapper.toDomain(doc as ReportDocument);
  }

  // Admin — update all review fields at once
  async resolveReport(
    id:   string,
    data: Partial<Pick<ReportEntity,
      | 'status'
      | 'reviewedBy'
      | 'reviewedAt'
      | 'adminNote'
      | 'actionTaken'
    >>,
  ): Promise<ReportEntity | null> {
    const update: Record<string, unknown> = {};
    if (data.status      !== undefined) update.status      = data.status;
    if (data.reviewedBy  !== undefined) update.reviewedBy  = data.reviewedBy;
    if (data.reviewedAt  !== undefined) update.reviewedAt  = data.reviewedAt;
    if (data.adminNote   !== undefined) update.adminNote   = data.adminNote;
    if (data.actionTaken !== undefined) update.actionTaken = data.actionTaken;

    const doc = await ReportModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true },
    ).lean();

    if (!doc) return null;
    return ReportInfraMapper.toDomain(doc as ReportDocument);
  }

  // Duplicate check — only PENDING reports block a new submission
  async findPendingReport(
    reporterId:     string,
    reportedUserId: string,
  ): Promise<ReportEntity | null> {
    const doc = await ReportModel.findOne({
      reporterId,
      reportedUserId,
      status: ReportStatus.PENDING,
    }).lean();
    if (!doc) return null;
    return ReportInfraMapper.toDomain(doc as ReportDocument);
  }

  // Count all reports against a user — admin insight
  async countByReportedUser(reportedUserId: string): Promise<number> {
    return ReportModel.countDocuments({ reportedUserId });
  }
}