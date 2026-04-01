import React, { useState, useMemo, useEffect } from 'react';
import { X, ChevronDown, Calendar, Clock, ShieldCheck, Users as UsersIcon, Check } from 'lucide-react';
import type { CreateRoomPayload, RoomFeature } from '../api/studyRoomApi';
import { chatApi, type ConversationResponseDTO } from '../../chat/api/chatApi';

interface CreateRoomModalProps {
  onClose: () => void;
  onSubmit: (payload: CreateRoomPayload) => void;
  isLoading?: boolean;
}

const MAX_PARTICIPANTS_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10];
const LEVEL_OPTIONS = ['ANY', 'EARLY_BIRD', 'BEGINNER', 'LEARNER', 'EXPLORER', 'ACHIEVER', 'EXPERT', 'PRODIGY', 'MASTER'];

// Helper: get today's date as YYYY-MM-DD
const getTodayDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Helper: get current time as HH:MM
const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ onClose, onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [levelRequired, setLevelRequired] = useState('ANY');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [isPublic, setIsPublic] = useState(true);
  const [startDate, setStartDate] = useState(getTodayDate());
  const [startTime, setStartTime] = useState(getCurrentTime());
  const [endTime, setEndTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });
  const [buddies, setBuddies] = useState<ConversationResponseDTO[]>([]);
  const [selectedBuddyIds, setSelectedBuddyIds] = useState<string[]>([]);
  const [isFetchingBuddies, setIsFetchingBuddies] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch buddies on mount
  useEffect(() => {
    const loadBuddies = async () => {
      try {
        setIsFetchingBuddies(true);
        const res = await chatApi.getConversations();
        if (res.success) {
          setBuddies(res.data);
        }
      } catch (err) {
        console.error('Failed to load buddies', err);
      } finally {
        setIsFetchingBuddies(false);
      }
    };
    loadBuddies();
  }, []);

  // Derived: minimum time only applies when date is today
  const minTime = useMemo(() => {
    if (startDate === getTodayDate()) {
      return getCurrentTime();
    }
    return '00:00';
  }, [startDate]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Room name is required';
    if (name.trim().length > 50) e.name = 'Max 50 characters';

    // Date/Time validation
    const today = getTodayDate();
    if (!startDate) {
      e.startDate = 'Date is required';
    } else if (startDate < today) {
      e.startDate = 'Date cannot be in the past';
    }

    if (!startTime) {
      e.startTime = 'Start time is required';
    } else if (startDate === today) {
      const now = new Date();
      const [h, m] = startTime.split(':').map(Number);
      const selectedStart = new Date();
      selectedStart.setHours(h, m, 0, 0);
      if (selectedStart <= now) {
        e.startTime = 'Time cannot be in the past';
      }
    }

    if (!endTime) {
      e.endTime = 'End time is required';
    } else {
      const startDateTime = new Date(`${startDate}T${startTime}:00`);
      const endDateTime = new Date(`${startDate}T${endTime}:00`);
      
      const diffMs = endDateTime.getTime() - startDateTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 1) {
        e.endTime = 'Study session must be at least 1 hour long';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toggleBuddy = (buddyId: string) => {
    setSelectedBuddyIds(prev => 
      prev.includes(buddyId) 
        ? prev.filter(id => id !== buddyId) 
        : [...prev, buddyId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const features: RoomFeature[] = ['CHAT', 'POMODORO'];

    const combinedStartDateTime = new Date(`${startDate}T${startTime}:00`).toISOString();
    const combinedEndDateTime = new Date(`${startDate}T${endTime}:00`).toISOString();

    const payload: CreateRoomPayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      type: isPublic ? 'PUBLIC' : 'PRIVATE',
      maxParticipants,
      levelRequired: levelRequired as any,
      features,
      startTime: combinedStartDateTime,
      endTime: combinedEndDateTime,
      tags: [],
      invitedUserIds: selectedBuddyIds
    };
    onSubmit(payload);
  };

  const handleDateChange = (newDate: string) => {
    setStartDate(newDate);
    setErrors(prev => {
      const { startDate: _, startTime: __, endTime: ____, ...rest } = prev;
      return rest;
    });
  };

  const handleTimeChange = (newTime: string) => {
    setStartTime(newTime);
    setErrors(prev => {
      const { startTime: _, endTime: __, ...rest } = prev;
      return rest;
    });
  };

  const handleEndTimeChange = (newTime: string) => {
    setEndTime(newTime);
    setErrors(prev => {
      const { endTime: _, ...rest } = prev;
      return rest;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Create New Study Room</h2>
              <p className="text-sm text-zinc-400 mt-0.5">Set up a focused environment for collaborative learning</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-2 gap-4">
            {/* Room Name */}
            <div className="col-span-1">
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Room Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="JavaScript Study Group"
                className="w-full bg-zinc-800 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[blueviolet]/50 transition-colors"
              />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>

            {/* Max Participants */}
            <div className="col-span-1">
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Max Participants (Min 3)</label>
              <div className="relative">
                <select
                  value={maxParticipants}
                  onChange={e => setMaxParticipants(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-white/10 rounded-xl py-2.5 pl-3.5 pr-8 text-sm text-zinc-200 focus:outline-none focus:border-[blueviolet]/50 transition-colors appearance-none"
                >
                  {MAX_PARTICIPANTS_OPTIONS.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Join who have basic knowledge in Javascript and want to improve..."
              rows={3}
              className="w-full bg-zinc-800 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[blueviolet]/50 transition-colors resize-none"
            />
          </div>

          {/* Level Required & Room Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> Level Required</span>
              </label>
              <div className="relative">
                <select
                  value={levelRequired}
                  onChange={e => setLevelRequired(e.target.value)}
                  className="w-full bg-zinc-800 border border-white/10 rounded-xl py-2.5 pl-3.5 pr-8 text-sm text-zinc-200 focus:outline-none focus:border-[blueviolet]/50 transition-colors appearance-none"
                >
                  {LEVEL_OPTIONS.map(o => (
                    <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Room Type</label>
              <label className="flex items-center gap-3 cursor-pointer mt-1">
                <div
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer ${isPublic ? 'bg-[blueviolet]' : 'bg-zinc-700'}`}
                  style={{ height: '22px' }}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </div>
                <span className="text-sm text-zinc-300">{isPublic ? 'Public Room' : 'Private Room'}</span>
              </label>
            </div>
          </div>

          {/* Date + Start/End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                <span className="flex items-center gap-1.5"><Calendar size={12} /> Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                min={getTodayDate()}
                onChange={e => handleDateChange(e.target.value)}
                className={`w-full bg-zinc-800 border rounded-xl py-2.5 px-3.5 text-sm text-zinc-200 focus:outline-none focus:border-[blueviolet]/50 transition-colors ${
                  errors.startDate ? 'border-red-500/60' : 'border-white/10'
                }`}
                style={{ colorScheme: 'dark' }}
              />
              {errors.startDate && <p className="text-xs text-red-400 mt-1">{errors.startDate}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  <span className="flex items-center gap-1.5"><Clock size={12} /> Start</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  min={startDate === getTodayDate() ? minTime : undefined}
                  onChange={e => handleTimeChange(e.target.value)}
                  className={`w-full bg-zinc-800 border rounded-xl py-2.5 px-3.5 text-sm text-zinc-200 focus:outline-none focus:border-[blueviolet]/50 transition-colors ${
                    errors.startTime ? 'border-red-500/60' : 'border-white/10'
                  }`}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  <span className="flex items-center gap-1.5"><Clock size={12} /> End</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => handleEndTimeChange(e.target.value)}
                  className={`w-full bg-zinc-800 border rounded-xl py-2.5 px-3.5 text-sm text-zinc-200 focus:outline-none focus:border-[blueviolet]/50 transition-colors ${
                    errors.endTime ? 'border-red-500/60' : 'border-white/10'
                  }`}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>
          </div>
          {errors.startTime && <p className="text-xs text-red-400 mt-1">{errors.startTime}</p>}
          {errors.endTime && <p className="text-xs text-red-400 mt-1">{errors.endTime}</p>}


          {/* Select Buddies */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><UsersIcon size={12} /> Invite Buddies</span>
              <span className="text-[10px] text-zinc-500">{selectedBuddyIds.length} Selected</span>
            </label>
            <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-2 max-h-40 overflow-y-auto custom-scrollbar">
              {isFetchingBuddies ? (
                <div className="py-4 text-center text-xs text-zinc-500 animate-pulse">Loading buddies...</div>
              ) : buddies.length === 0 ? (
                <div className="py-4 text-center text-xs text-zinc-500">No buddies found to invite.</div>
              ) : (
                <div className="grid grid-cols-1 gap-1">
                  {buddies.map(conv => (
                    <button
                      key={conv.otherUser.userId}
                      type="button"
                      onClick={() => toggleBuddy(conv.otherUser.userId)}
                      className={`flex items-center justify-between p-2 rounded-lg transition-all text-left ${
                        selectedBuddyIds.includes(conv.otherUser.userId)
                          ? 'bg-[blueviolet]/10 border border-[blueviolet]/20'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">
                          {conv.otherUser.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-zinc-200">{conv.otherUser.fullName}</span>
                      </div>
                      {selectedBuddyIds.includes(conv.otherUser.userId) && (
                        <Check size={14} className="text-[blueviolet]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 sticky bottom-0 bg-zinc-900 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[blueviolet] hover:bg-[blueviolet]/80 shadow-lg shadow-[blueviolet]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
