import React, { useState } from 'react';
import {
  Loader, Calendar, Users, Clock, // AlertTriangle,
  Search, X, ChevronLeft, ChevronRight, ChevronDown,
  Eye, Zap, Radio, // Flag, Check,
  Globe, Lock,
} from 'lucide-react';
import { useAdminMeetings, type UnifiedMeeting, type MeetingType, type MeetingStatus } from '../hooks/useAdminMeetings';

// ─── Stat Card ─────────────────────────────────────────────────────────────

interface StatCardProps {
  label:    string;
  value:    number;
  sub:      string;
  icon:     React.ReactNode;
  accent:   string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, accent }) => (
  <div className={`relative overflow-hidden bg-[#18181B] border border-[#27272A] rounded-2xl p-5 flex flex-col gap-3`}>
    <div className="flex items-center justify-between">
      <p className="text-[#A1A1AA] text-sm font-medium">{label}</p>
      <div className={`p-2 rounded-xl ${accent}`}>{icon}</div>
    </div>
    <div>
      <p className="text-3xl font-bold text-white tabular-nums">{value.toLocaleString()}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>
    </div>
  </div>
);

// ─── Status Badge ──────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: UnifiedMeeting['status'] }> = ({ status }) => {
  const cfg = {
    ACTIVE:    { label: 'Active',    cls: 'bg-red-500/15 text-red-400',     dot: 'bg-red-400 animate-pulse' },
    COMPLETED: { label: 'Completed', cls: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-400' },
    MISSED:    { label: 'Missed',    cls: 'bg-zinc-700 text-zinc-400',       dot: 'bg-zinc-400' },
    PLANNED:   { label: 'Planned',   cls: 'bg-blue-500/15 text-blue-400',    dot: 'bg-blue-400' },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Type Badge ────────────────────────────────────────────────────────────

const TypeBadge: React.FC<{ type: UnifiedMeeting['type'] }> = ({ type }) => {
  const cfg = {
    BUDDY: { label: '1:1',   icon: <Users size={11} />, cls: 'bg-violet-500/15 text-violet-400' },
    ROOM:  { label: 'Group', icon: <Globe size={11} />, cls: 'bg-amber-500/15  text-amber-400'  },
  }[type];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ─── Detail Panel ──────────────────────────────────────────────────────────

interface DetailPanelProps {
  meeting:    UnifiedMeeting;
  onClose:    () => void;
  onForceClose: (id: string, type: 'BUDDY' | 'ROOM' | 'POMODORO') => Promise<boolean>;
  isClosing:  string | null;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ meeting, onClose, onForceClose, isClosing }) => {
  const [confirming, setConfirming] = useState(false);
  const closing = isClosing === meeting.id;

  const dur = meeting.durationMinutes != null
    ? `${meeting.durationMinutes} min`
    : meeting.status === 'ACTIVE' ? 'Ongoing' : '—';

  const fmt = (iso?: string) =>
    iso ? new Date(iso).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const handleForceClose = async () => {
    const ok = await onForceClose(meeting.id, meeting.type);
    if (ok) { setConfirming(false); onClose(); }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-end sm:justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Panel — slides in from right on desktop */}
      <div
        className="bg-[#0D0D10] border border-[#27272A] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#27272A] sticky top-0 bg-[#0D0D10] z-10">
          <div className="flex items-center gap-3">
            <TypeBadge type={meeting.type} />
            <StatusBadge status={meeting.status} />
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Session meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#18181B] border border-[#27272A]">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Duration</p>
              <p className="text-sm font-bold text-white">{dur}</p>
            </div>
            {/* <div className="p-3.5 rounded-xl bg-[#18181B] border border-[#27272A]">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Reports</p>
              <p className={`text-sm font-bold ${meeting.reportCount > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                {meeting.reportCount > 0 ? `${meeting.reportCount} filed` : 'None'}
              </p>
            </div> */}
            {meeting.startedAt && (
              <div className="p-3.5 rounded-xl bg-[#18181B] border border-[#27272A] col-span-2">
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Started</p>
                <p className="text-sm text-white">{fmt(meeting.startedAt)}</p>
              </div>
            )}
            {meeting.endedAt && (
              <div className="p-3.5 rounded-xl bg-[#18181B] border border-[#27272A] col-span-2">
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Ended</p>
                <p className="text-sm text-white">{fmt(meeting.endedAt)}</p>
              </div>
            )}
            {meeting.scheduledAt && !meeting.startedAt && (
              <div className="p-3.5 rounded-xl bg-[#18181B] border border-[#27272A] col-span-2">
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Scheduled</p>
                <p className="text-sm text-white">{fmt(meeting.scheduledAt)}</p>
              </div>
            )}
          </div>

          {/* Room info (Group only) */}
          {meeting.type === 'ROOM' && meeting.roomName && (
            <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-2">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Room Info</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">{meeting.roomName}</p>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${meeting.roomType === 'PUBLIC' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {meeting.roomType === 'PUBLIC' ? <Globe size={10} /> : <Lock size={10} />}
                  {meeting.roomType}
                </span>
              </div>
              {meeting.maxParticipants && (
                <p className="text-xs text-zinc-500">Max {meeting.maxParticipants} participants</p>
              )}
              {meeting.roomTags && meeting.roomTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {meeting.roomTags.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#27272A] text-zinc-400">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Participants */}
          <div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
              Participants ({meeting.participants.length})
            </p>
            <div className="space-y-2">
              {meeting.participants.map(p => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#18181B] border border-[#27272A]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {p.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{p.fullName}</p>
                    <p className="text-[11px] text-zinc-500">{p.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Actions */}
          {meeting.status === 'ACTIVE' && (
            <div className="pt-2 border-t border-[#27272A]">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Admin Actions</p>
              {!confirming ? (
                <button
                  onClick={() => setConfirming(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-semibold text-sm transition-all"
                >
                  <Zap size={15} />
                  Force Close Session
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-3">
                  <p className="text-sm text-red-400 font-medium text-center">Are you sure? This will end the session immediately.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirming(false)}
                      className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleForceClose}
                      disabled={closing}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 text-sm font-semibold transition-all"
                    >
                      {closing ? 'Closing...' : 'Yes, Force Close'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Filter Chips ──────────────────────────────────────────────────────────

interface ChipGroupProps<T extends string> {
  options: { value: T; label: string }[];
  value:   T;
  onChange:(v: T) => void;
}

function ChipGroup<T extends string>({ options, value, onChange }: ChipGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            value === o.value
              ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/20'
              : 'bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-zinc-600'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export const AdminMeetingsPage: React.FC = () => {
  const {
    sessions, total, totalPages, stats, isLoading, isClosing,
    page, limit, type, status, from, to, searchInput,
    setPage, setLimit, setType, setStatus, setFrom, setTo, setSearchInput,
    forceClose,
  } = useAdminMeetings();

  const [selected, setSelected] = useState<UnifiedMeeting | null>(null);

  const typeOptions: { value: MeetingType; label: string }[] = [
    { value: 'ALL',   label: 'All Types'    },
    { value: 'BUDDY', label: '👥 1:1 Buddy'  },
    { value: 'ROOM',  label: '🏠 Group Room' },
  ];

  const statusOptions: { value: MeetingStatus; label: string }[] = [
    { value: 'ALL',       label: 'All'       },
    { value: 'ACTIVE',    label: '🔴 Active'   },
    { value: 'COMPLETED', label: '🟢 Completed'},
    // { value: 'MISSED',    label: '⚫ Missed'   },
    { value: 'PLANNED',   label: '🔵 Planned'  },
  ];

  const fmtDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—';

  /*
  const fmtDur = (m: UnifiedMeeting) => {
    if (m.status === 'ACTIVE')  return <span className="flex items-center gap-1 text-red-400 text-xs font-semibold"><Radio size={11} className="animate-pulse" />Ongoing</span>;
    if (m.durationMinutes != null) return `${m.durationMinutes} min`;
    return <span className="text-zinc-600">—</span>;
  };
  */

  const participantLabel = (m: UnifiedMeeting) => {
    if (m.type === 'ROOM') {
      const host = m.participants.find(p => p.role === 'Host');
      return host ? host.fullName : '—';
    }
    // BUDDY — show initiator only
    const initiator = m.participants.find(p => p.role === 'Initiator');
    return initiator ? initiator.fullName : (m.participants[0]?.fullName ?? '—');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Calendar size={22} className="text-[#2563EB]" />
            Meeting Management
          </h1>
          <p className="text-[#A1A1AA] text-sm mt-1">Overview of all study sessions across ProTime</p>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Sessions"
          value={stats.total}
          sub="All time"
          icon={<Calendar size={16} className="text-[#2563EB]" />}
          accent="bg-[#2563EB]/10"
        />
        <StatCard
          label="Live Now"
          value={stats.liveNow}
          sub="Active now"
          icon={<Radio size={16} className="text-red-400" />}
          accent="bg-red-500/10"
        />
        <StatCard
          label="Today"
          value={stats.today}
          sub="Last 24 hrs"
          icon={<Clock size={16} className="text-emerald-400" />}
          accent="bg-emerald-500/10"
        />
        {/* <StatCard
          label="Reported"
          value={stats.reported}
          sub="Need review"
          icon={<AlertTriangle size={16} className="text-amber-400" />}
          accent="bg-amber-500/10"
        /> */}
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Type chips */}
          <div className="flex-1 space-y-1.5">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Session Type</p>
            <ChipGroup options={typeOptions} value={type} onChange={setType} />
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              id="meeting-search"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by participant name…"
              className="w-full bg-[#0D0D10] border border-[#27272A] rounded-xl pl-8 pr-8 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#2563EB] transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Status chips */}
          <div className="flex-1 space-y-1.5">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Status</p>
            <ChipGroup options={statusOptions} value={status} onChange={setStatus} />
          </div>
          {/* Date range */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">From</p>
              <input
                type="date"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="bg-[#0D0D10] border border-[#27272A] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#2563EB] transition-colors [color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">To</p>
              <input
                type="date"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="bg-[#0D0D10] border border-[#27272A] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#2563EB] transition-colors [color-scheme:dark]"
              />
            </div>
            {(from || to) && (
              <button
                onClick={() => { setFrom(''); setTo(''); }}
                title="Clear dates"
                className="mt-5 p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-[#2563EB]" size={28} />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#A1A1AA]">
            <Calendar size={32} className="mb-3 opacity-30 text-[#2563EB]" />
            <p className="font-medium text-white">No sessions found</p>
            <p className="text-xs mt-1">Try adjusting your filters or date range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#27272A] text-[#A1A1AA] text-left">
                  <th className="px-5 py-4 font-semibold whitespace-nowrap">Type</th>
                  <th className="px-5 py-4 font-semibold whitespace-nowrap">Participants</th>
                  <th className="px-5 py-4 font-semibold whitespace-nowrap">Room / Context</th>
                  <th className="px-5 py-4 font-semibold whitespace-nowrap">Status</th>
                  {/* <th className="px-5 py-4 font-semibold whitespace-nowrap">Duration</th> */}
                  <th className="px-5 py-4 font-semibold whitespace-nowrap">Date</th>
                  {/* <th className="px-5 py-4 font-semibold whitespace-nowrap">Reported</th> */}
                  <th className="px-5 py-4 font-semibold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(m => (
                  <tr
                    key={m.id}
                    className="border-t border-[#27272A] hover:bg-[#1F1F23] transition-colors"
                  >
                    {/* Type */}
                    <td className="px-5 py-4">
                      <TypeBadge type={m.type} />
                    </td>

                    {/* Participants */}
                    <td className="px-5 py-4 max-w-[180px]">
                      <p className="text-white text-sm font-medium truncate">{participantLabel(m)}</p>
                    </td>

                    {/* Room / Context */}
                    <td className="px-5 py-4">
                      {m.type === 'ROOM' ? (
                        <div>
                          <p className="text-white text-sm font-medium">{m.roomName}</p>
                          <span className={`text-[10px] font-semibold ${m.roomType === 'PUBLIC' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {m.roomType === 'PUBLIC' ? '🌐 Public' : '🔒 Private'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs">Buddy Session</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={m.status} />
                    </td>

                    {/* Duration */}
                    {/* <td className="px-5 py-4 text-[#A1A1AA] text-sm whitespace-nowrap">
                      {fmtDur(m)}
                    </td> */}

                    {/* Date */}
                    <td className="px-5 py-4 text-[#A1A1AA] text-xs whitespace-nowrap">
                      {fmtDate(m.sortDate)}
                    </td>

                    {/* Reported */}
                    {/* <td className="px-5 py-4">
                      {m.reportCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-500/15 text-red-400">
                          <Flag size={10} /> {m.reportCount}
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-xs flex items-center gap-1">
                          <Check size={12} /> None
                        </span>
                      )}
                    </td> */}

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          id={`meeting-view-${m.id}`}
                          onClick={() => setSelected(m)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all"
                        >
                          <Eye size={13} /> View
                        </button>
                        {m.status === 'ACTIVE' && (
                          <button
                            id={`meeting-close-${m.id}`}
                            onClick={() => setSelected(m)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all border border-red-500/20"
                          >
                            <Zap size={13} /> Force End
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {!isLoading && sessions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <p className="text-sm text-zinc-500">
            Showing{' '}
            <span className="text-white font-medium">{(page - 1) * limit + 1}</span> to{' '}
            <span className="text-white font-medium">{Math.min(page * limit, total)}</span> of{' '}
            <span className="text-white font-medium">{total}</span> sessions
          </p>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={limit}
                onChange={e => setLimit(Number(e.target.value))}
                className="appearance-none bg-[#18181B] border border-[#27272A] text-xs text-zinc-300 rounded-lg pl-2.5 pr-7 py-2 outline-none focus:border-[#2563EB] cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-bold text-white">
                {page} / {totalPages || 1}
              </div>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="p-2 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Panel ────────────────────────────────────────────────── */}
      {selected && (
        <DetailPanel
          meeting={selected}
          onClose={() => setSelected(null)}
          onForceClose={forceClose}
          isClosing={isClosing}
        />
      )}
    </div>
  );
};
