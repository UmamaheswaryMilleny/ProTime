import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Globe, Lock, Loader2, BookOpen } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchRooms, fetchMyRooms, joinRoom, requestToJoin, createRoom, fetchAllRequests } from '../store/studyRoomSlice';
import { RoomCard } from '../components/RoomCard';
import { CreateRoomModal } from '../components/CreateRoomModal';
import { studyRoomApi } from '../api/studyRoomApi';
import type { GetRoomsParams, CreateRoomPayload } from '../api/studyRoomApi';
import { ROUTES } from '../../../shared/constants/constants.routes';
import toast from 'react-hot-toast';

type ActiveTab = 'MY_ROOMS' | 'EXPLORE' | 'REQUESTS';
type FilterType = 'ALL' | 'PUBLIC' | 'PRIVATE';

import { RequestsTab } from '../components/RequestsTab';

export const StudyRoomsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { rooms, myRooms, invitations, isLoading } = useAppSelector(s => s.studyRoom);
  const { user } = useAppSelector(s => s.auth);

  const [tab, setTab] = useState<ActiveTab>('EXPLORE');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [limitData, setLimitData] = useState<{ count: number; limit: number; isLimitReached: boolean; isPremium: boolean } | null>(null);

  const fetchLimit = useCallback(async () => {
    try {
      const res = await studyRoomApi.checkCreationLimit();
      if (res.success) {
        setLimitData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch room limit', err);
    }
  }, []);

  // Fetch invitations and creation limit on mount
  useEffect(() => {
    dispatch(fetchAllRequests());
    fetchLimit();
  }, [dispatch, fetchLimit]);

  // Fetch rooms on mount and when tab/filter/search changes
  useEffect(() => {
    if (tab === 'MY_ROOMS') {
      dispatch(fetchMyRooms());
    } else if (tab === 'REQUESTS') {
      dispatch(fetchAllRequests());
    } else {
      const params: GetRoomsParams = {};
      if (filter !== 'ALL') params.type = filter;
      if (search.trim()) params.search = search.trim();
      dispatch(fetchRooms(params));
    }
  }, [dispatch, tab, filter, search]);

  const handleJoin = useCallback(async (roomId: string) => {
    try {
      setJoiningRoomId(roomId);
      await dispatch(joinRoom(roomId)).unwrap();
      toast.success('Joined room successfully!');
      navigate(`${ROUTES.DASHBOARD_STUDY_ROOMS}/${roomId}`);
    } catch (e: any) {
      toast.error(e || 'Failed to join room');
    } finally {
      setJoiningRoomId(null);
    }
  }, [dispatch, navigate]);

  const handleRequest = useCallback(async (roomId: string) => {
    try {
      await dispatch(requestToJoin(roomId)).unwrap();
      toast.success('Join request sent!');
    } catch (e: any) {
      toast.error(e || 'Failed to send request');
    }
  }, [dispatch]);

  const handleCreateRoom = useCallback(async (payload: CreateRoomPayload) => {
    try {
      setIsCreating(true);
      const result = await dispatch(createRoom(payload)).unwrap();
      toast.success('Room created!');
      setShowCreateModal(false);
      fetchLimit();
      navigate(`${ROUTES.DASHBOARD_STUDY_ROOMS}/${result.id}`);
    } catch (e: any) {
      toast.error(e || 'Failed to create room');
    } finally {
      setIsCreating(false);
    }
  }, [dispatch, navigate, fetchLimit]);

  // In Explore tab: hide rooms that are expired (ENDED status or their session time
  // has already passed). My Rooms always shows the user's full history.
  const now = Date.now();
  const displayRooms = (tab === 'MY_ROOMS' ? myRooms : rooms).filter(room => {
    if (tab === 'MY_ROOMS') return true;  // show everything in My Rooms
    if (room.status === 'ENDED') return false;
    if (room.status === 'LIVE') return true; // always show live sessions
    // WAITING rooms whose session time has definitively passed
    const isPast = room.endTime
      ? new Date(room.endTime) < new Date()
      : room.startTime
        ? new Date(room.startTime).getTime() + 4 * 60 * 60 * 1000 < now
        : false;
    return !isPast;
  });

  const tabItems: { key: ActiveTab; label: string }[] = [
    { key: 'MY_ROOMS', label: 'My Rooms' },
    { key: 'EXPLORE', label: 'Explore Rooms' },
    { key: 'REQUESTS', label: 'Requests' },
  ];

  const filterItems: { key: FilterType; label: string; icon?: React.ReactNode }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'PUBLIC', label: 'Public', icon: <Globe size={13} /> },
    { key: 'PRIVATE', label: 'Private', icon: <Lock size={13} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="text-3xl">📚</span>
            Study Rooms
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Join A Group To Study, Focus, Or Co-Work Together</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative group flex-shrink-0">
          <button
            disabled={limitData?.isLimitReached}
            onClick={() => setShowCreateModal(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
              limitData?.isLimitReached
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                : 'bg-[blueviolet] text-white hover:bg-[blueviolet]/80 shadow-lg shadow-[blueviolet]/20'
            }`}
          >
            <Plus size={16} />
            Create new Room
          </button>
          {limitData?.isLimitReached && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max hidden group-hover:block bg-zinc-950 text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 shadow-xl pointer-events-none z-50 whitespace-nowrap">
              this month limit is over
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-950" />
            </div>
          )}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search username....."
            className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[blueviolet]/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {filterItems.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                filter === f.key
                  ? 'bg-[blueviolet] text-white border-[blueviolet] shadow-lg shadow-[blueviolet]/20'
                  : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
        {tabItems.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`py-3 text-sm font-semibold transition-all ${
              tab === t.key
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Room Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-[blueviolet]" />
        </div>
      ) : tab === 'REQUESTS' ? (
        <RequestsTab />
      ) : displayRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 gap-3">
          <BookOpen size={48} className="opacity-20" />
          <p className="text-sm">
            {tab === 'MY_ROOMS'
              ? "You haven't created or joined any rooms yet."
              : 'No rooms found. Try a different filter or create one!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayRooms.map(room => {
            const isInvited = (invitations || []).some(inv => inv.roomId === room.id && inv.status === 'INVITED');
            return (
              <RoomCard
                key={room.id}
                room={room}
                currentUserId={user?.id || ''}
                onJoin={handleJoin}
                onRequest={handleRequest}
                isJoining={joiningRoomId === room.id}
                isInvited={isInvited}
              />
            );
          })}
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRoom}
          isLoading={isCreating}
        />
      )}
    </div>
  );
};
