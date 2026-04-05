import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ProTimeBackend } from '../../../api/instance';
import { API_ROUTES } from '../../../shared/constants/constants.routes';
import { useDebounce } from '../../../hooks/useDebounce';

// ─── Types ─────────────────────────────────────────────────────────────────

export type MeetingType   = 'ALL' | 'BUDDY' | 'ROOM';
export type MeetingStatus = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'MISSED' | 'PLANNED';

export interface MeetingParticipant {
  id:       string;
  fullName: string;
  avatar?:  string;
  role:     string;
}

export interface UnifiedMeeting {
  id:               string;
  type:             'BUDDY' | 'ROOM';
  status:           'ACTIVE' | 'COMPLETED' | 'MISSED' | 'PLANNED';
  participants:     MeetingParticipant[];
  roomName?:        string;
  roomType?:        'PUBLIC' | 'PRIVATE';
  roomTags?:        string[];
  maxParticipants?: number;
  scheduledAt?:     string;
  startedAt?:       string;
  endedAt?:         string;
  durationMinutes?: number;
  reportCount:      number;
  sortDate:         string;
}

export interface MeetingStats {
  total:    number;
  liveNow:  number;
  today:    number;
  reported: number;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAdminMeetings() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page   = Math.max(1, Number(searchParams.get('page')  ?? '1'));
  const limit  = Math.max(1, Number(searchParams.get('limit') ?? '20'));
  const type   = (searchParams.get('type')   ?? 'ALL') as MeetingType;
  const status = (searchParams.get('status') ?? 'ALL') as MeetingStatus;
  const from   = searchParams.get('from')   ?? '';
  const to     = searchParams.get('to')     ?? '';
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const debouncedSearch = useDebounce(searchInput, 400);

  const [sessions,   setSessions]   = useState<UnifiedMeeting[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats,      setStats]      = useState<MeetingStats>({ total: 0, liveNow: 0, today: 0, reported: 0 });
  const [isLoading,  setIsLoading]  = useState(false);
  const [isClosing,  setIsClosing]  = useState<string | null>(null);

  // ── Param setters ────────────────────────────────────────────────────────
  const setPage   = (v: number) => setSearchParams(p => { const n = new URLSearchParams(p); n.set('page', String(v)); return n; });
  const setLimit  = (v: number) => setSearchParams(p => { const n = new URLSearchParams(p); n.set('limit', String(v)); n.set('page', '1'); return n; });
  const setType   = (v: MeetingType)   => setSearchParams(p => { const n = new URLSearchParams(p); n.set('type', v); n.set('page', '1'); return n; });
  const setStatus = (v: MeetingStatus) => setSearchParams(p => { const n = new URLSearchParams(p); n.set('status', v); n.set('page', '1'); return n; });
  const setFrom   = (v: string) => setSearchParams(p => { const n = new URLSearchParams(p); if (v) n.set('from', v); else n.delete('from'); n.set('page', '1'); return n; });
  const setTo     = (v: string) => setSearchParams(p => { const n = new URLSearchParams(p); if (v) n.set('to', v); else n.delete('to'); n.set('page', '1'); return n; });

  // Keep search in URL (debounced)
  useEffect(() => {
    setSearchParams(p => {
      const n = new URLSearchParams(p);
      if (debouncedSearch.trim()) n.set('search', debouncedSearch.trim());
      else n.delete('search');
      n.set('page', '1');
      return n;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page:  String(page),
        limit: String(limit),
        type,
        status,
      };
      if (from) params.from = from;
      if (to)   params.to   = to;
      const search = searchParams.get('search');
      if (search) params.search = search;

      const res = await ProTimeBackend.get(API_ROUTES.ADMIN_MEETINGS, { params });
      if (res.data.success) {
        const { sessions: s, total: t, totalPages: tp, stats: st } = res.data.data;
        setSessions(s);
        setTotal(t);
        setTotalPages(tp);
        setStats(st);
      }
    } catch {
      toast.error('Failed to load meetings.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, type, status, from, to, searchParams]);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  // ── Force Close ───────────────────────────────────────────────────────────
  const forceClose = useCallback(async (id: string, meetingType: 'BUDDY' | 'ROOM' | 'POMODORO') => {
    setIsClosing(id);
    try {
      const res = await ProTimeBackend.patch(API_ROUTES.ADMIN_MEETING_FORCE_CLOSE(id), { type: meetingType });
      if (res.data.success) {
        toast.success('Session force-closed.');
        fetchMeetings();
        return true;
      }
      toast.error(res.data.message ?? 'Failed to close session.');
      return false;
    } catch {
      toast.error('Error closing session.');
      return false;
    } finally {
      setIsClosing(null);
    }
  }, [fetchMeetings]);

  return {
    // data
    sessions, total, totalPages, stats, isLoading, isClosing,
    // filters
    page, limit, type, status, from, to, searchInput,
    // setters
    setPage, setLimit, setType, setStatus, setFrom, setTo, setSearchInput,
    // actions
    forceClose, fetchMeetings,
  };
}
