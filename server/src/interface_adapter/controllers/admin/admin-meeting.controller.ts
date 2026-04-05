import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';
import mongoose from 'mongoose';

import { ResponseHelper } from '../../helpers/response.helper';
import { HTTP_STATUS } from '../../../shared/constants/constants';

import { BuddySessionModel }  from '../../../infrastructure/database/models/buddy-session.model';
import { StudyRoomModel }     from '../../../infrastructure/database/models/study-room.model';
import { ReportModel }        from '../../../infrastructure/database/models/report.model';
import { UserModel }          from '../../../infrastructure/database/models/user.model';

import { SessionStatus }      from '../../../domain/enums/calendar.enums';
import { RoomStatus }         from '../../../domain/enums/study-room.enums';

// ─── Unified shape returned to frontend ─────────────────────────────────────
export interface UnifiedMeetingItem {
  id:               string;
  type:             'BUDDY' | 'ROOM';
  /** Derived unified status for display */
  status:           'ACTIVE' | 'COMPLETED' | 'MISSED' | 'PLANNED';
  participants:     { id: string; fullName: string; avatar?: string; role: string }[];
  roomName?:        string;
  roomType?:        'PUBLIC' | 'PRIVATE';
  roomTags?:        string[];
  maxParticipants?: number;
  scheduledAt?:     string;
  startedAt?:       string;
  endedAt?:         string;
  durationMinutes?: number;
  reportCount:      number;
  /** ISO string used for sorting */
  sortDate:         string;
}

// ─── Stats sent alongside list ────────────────────────────────────────────
interface MeetingStats {
  total:    number;
  liveNow:  number;
  today:    number;
  reported: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function toStr(id: unknown): string {
  return id ? id.toString() : '';
}

/** Convert RoomStatus → unified status */
function roomStatusToUnified(s: RoomStatus): 'ACTIVE' | 'COMPLETED' | 'PLANNED' {
  if (s === RoomStatus.LIVE)   return 'ACTIVE';
  if (s === RoomStatus.ENDED)  return 'COMPLETED';
  return 'PLANNED'; // WAITING
}

/** Convert SessionStatus → unified status */
function sessionStatusToUnified(s: SessionStatus): 'ACTIVE' | 'COMPLETED' | 'MISSED' | 'PLANNED' {
  switch (s) {
    case SessionStatus.ACTIVE:    return 'ACTIVE';
    case SessionStatus.COMPLETED: return 'COMPLETED';
    case SessionStatus.MISSED:    return 'MISSED';
    default:                      return 'PLANNED';
  }
}

@injectable()
export class AdminMeetingController {

  // ─── GET /admin/meetings ───────────────────────────────────────────────────
  async getMeetings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type    = (req.query.type    as string) || 'ALL';
      const status  = (req.query.status  as string) || 'ALL';
      const from    = req.query.from    as string | undefined;
      const to      = req.query.to      as string | undefined;
      const search  = (req.query.search as string | undefined)?.trim();
      const page    = Math.max(1, Number(req.query.page  ?? 1));
      const limit   = Math.max(1, Math.min(100, Number(req.query.limit ?? 20)));

      // ── Optional search: resolve matching user IDs ────────────────────────
      let searchUserIds: string[] | null = null;
      if (search) {
        const regex = new RegExp(search, 'i');
        const users = await UserModel.find({
          $or: [{ fullName: regex }, { email: regex }],
        }).select('_id').lean();
        searchUserIds = users.map(u => u._id.toString());
      }

      // ── Date range ────────────────────────────────────────────────────────
      const fromDate = from ? new Date(from) : undefined;
      const toDate   = to   ? new Date(`${to}T23:59:59.999Z`) : undefined;

      const dateFilter = (fromDate || toDate)
        ? {
            createdAt: {
              ...(fromDate && { $gte: fromDate }),
              ...(toDate   && { $lte: toDate   }),
            },
          }
        : {};

      // ── Build raw results from each source in parallel ────────────────────
      const results: UnifiedMeetingItem[] = [];

      // We need the user lookup for participants
      const userCache: Record<string, { fullName: string; avatar?: string }> = {};
      const resolveUser = async (id: string) => {
        if (userCache[id]) return userCache[id];
        const u = await UserModel.findById(id).select('fullName').lean();
        const entry = { fullName: u?.fullName ?? 'Unknown User' };
        userCache[id] = entry;
        return entry;
      };

      // ────────────────────────────── BUDDY SESSIONS ───────────────────────
      if (type === 'ALL' || type === 'BUDDY') {
        const buddyFilter: Record<string, unknown> = { ...dateFilter };

        if (status !== 'ALL') {
          // Map unified → SessionStatus
          const mapStatus: Record<string, SessionStatus> = {
            ACTIVE:    SessionStatus.ACTIVE,
            COMPLETED: SessionStatus.COMPLETED,
            MISSED:    SessionStatus.MISSED,
            PLANNED:   SessionStatus.PLANNED,
          };
          if (mapStatus[status]) buddyFilter.status = mapStatus[status];
          else return; // no match possible
        }

        if (searchUserIds !== null) {
          const ids = searchUserIds.map(id => new mongoose.Types.ObjectId(id));
          buddyFilter.$or = [{ initiatorId: { $in: ids } }, { participantId: { $in: ids } }];
        }

        const buddySessions = await BuddySessionModel.find(buddyFilter).lean();

        for (const s of buddySessions) {
          const iId  = toStr(s.initiatorId);
          const pId  = toStr(s.participantId);
          const [initiator, participant] = await Promise.all([resolveUser(iId), resolveUser(pId)]);

          // Count reports filed between these two specific participants against each other
          const reportCount = await ReportModel.countDocuments({
            $or: [
              { reporterId: s.initiatorId, reportedUserId: s.participantId },
              { reporterId: s.participantId, reportedUserId: s.initiatorId },
            ],
          });

          const dur =
            s.startedAt && s.endedAt
              ? Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60_000)
              : undefined;

          results.push({
            id:         toStr(s._id),
            type:       'BUDDY',
            status:     sessionStatusToUnified(s.status),
            participants: [
              { id: iId, fullName: initiator.fullName, role: 'Initiator' },
              { id: pId, fullName: participant.fullName, role: 'Participant' },
            ],
            scheduledAt:     s.scheduledAt  ? s.scheduledAt.toISOString()  : undefined,
            startedAt:       s.startedAt    ? s.startedAt.toISOString()    : undefined,
            endedAt:         s.endedAt      ? s.endedAt.toISOString()      : undefined,
            durationMinutes: dur,
            reportCount,
            sortDate:   (s.startedAt ?? s.scheduledAt ?? s.createdAt).toISOString(),
          });
        }
      }

      // ────────────────────────────── ROOM SESSIONS ────────────────────────
      if (type === 'ALL' || type === 'ROOM') {
        const roomFilter: Record<string, unknown> = { ...dateFilter };

        if (status !== 'ALL') {
          const mapStatus: Record<string, RoomStatus> = {
            ACTIVE:    RoomStatus.LIVE,
            COMPLETED: RoomStatus.ENDED,
            PLANNED:   RoomStatus.WAITING,
          };
          // MISSED has no room equivalent — skip
          if (status === 'MISSED') {
            // no rooms can be missed — skip
          } else if (mapStatus[status]) {
            roomFilter.status = mapStatus[status];
          }
        }

        if (searchUserIds !== null) {
          const ids = searchUserIds.map(id => new mongoose.Types.ObjectId(id));
          roomFilter.$or = [
            { hostId:    { $in: ids } },
            { participantIds: { $in: ids } },
          ];
        }

        const rooms = await StudyRoomModel.find(roomFilter).lean();

        for (const r of rooms) {
          const hostId    = toStr(r.hostId);
          // Unique members = participantIds minus the host to avoid duplicates
          const memberOnlyIds = r.participantIds
            .map(toStr)
            .filter((id, idx, arr) => id && id !== hostId && arr.indexOf(id) === idx);

          const allIds = [hostId, ...memberOnlyIds].filter(Boolean);
          const resolved = await Promise.all(allIds.map(id => resolveUser(id)));

          const participantObjs = allIds.map((id, i) => ({
            id,
            fullName: (resolved[i] ?? { fullName: 'Unknown' }).fullName,
            role:     i === 0 ? 'Host' : 'Member',
          }));

          // Count GROUP_ROOM context reports against any member of this room
          const reportCount = await ReportModel.countDocuments({
            context:       'GROUP_ROOM',
            reportedUserId: { $in: allIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
          });

          results.push({
            id:             toStr(r._id),
            type:           'ROOM',
            status:         roomStatusToUnified(r.status),
            participants:   participantObjs,
            roomName:       r.name,
            roomType:       r.type as 'PUBLIC' | 'PRIVATE',
            roomTags:       r.tags ?? [],
            maxParticipants: r.maxParticipants,
            startedAt:      r.startTime ? new Date(r.startTime).toISOString() : undefined,
            endedAt:        r.endTime   ? new Date(r.endTime).toISOString()   : undefined,
            reportCount,
            sortDate:       r.createdAt.toISOString(),
          });
        }
      }

      // ── Sort merged results by date DESC ───────────────────────────────────
      results.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());

      // ── Pagination ────────────────────────────────────────────────────────
      const total      = results.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const sessions   = results.slice((page - 1) * limit, page * limit);

      // ── Stats (computed from full dataset) ────────────────────────────────
      const todayStr = new Date().toISOString().slice(0, 10);
      const stats: MeetingStats = {
        total,
        liveNow:  results.filter(r => r.status === 'ACTIVE').length,
        today:    results.filter(r => r.sortDate.startsWith(todayStr)).length,
        reported: results.filter(r => r.reportCount > 0).length,
      };

      ResponseHelper.success(res, HTTP_STATUS.OK, 'Meetings retrieved', {
        sessions,
        total,
        page,
        totalPages,
        stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── PATCH /admin/meetings/:meetingId/force-close ─────────────────────────
  async forceClose(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { meetingId } = req.params;
      const { type }      = req.body as { type: 'BUDDY' | 'ROOM' | 'POMODORO' };

      if (!type) {
        ResponseHelper.error(res, 'type is required in body', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      if (type === 'BUDDY') {
        const session = await BuddySessionModel.findByIdAndUpdate(
          meetingId,
          { $set: { status: SessionStatus.COMPLETED, endedAt: new Date() } },
          { new: true },
        ).lean();
        if (!session) {
          ResponseHelper.error(res, 'Buddy session not found', HTTP_STATUS.NOT_FOUND);
          return;
        }
      } else if (type === 'ROOM') {
        const room = await StudyRoomModel.findByIdAndUpdate(
          meetingId,
          { $set: { status: RoomStatus.ENDED, endTime: new Date().toISOString() } },
          { new: true },
        ).lean();
        if (!room) {
          ResponseHelper.error(res, 'Room not found', HTTP_STATUS.NOT_FOUND);
          return;
        }
      }

      ResponseHelper.success(res, HTTP_STATUS.OK, 'Session force-closed successfully');
    } catch (error) {
      next(error);
    }
  }
}
