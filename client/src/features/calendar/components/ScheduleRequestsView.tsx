import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Calendar as CalendarIcon, Clock, RotateCcw, User } from 'lucide-react';
import type { PendingScheduleRequest, RespondRequestPayload } from '../types/calendar.types';
import { useAppSelector } from '../../../store/hooks';

interface ScheduleRequestsViewProps {
  requests: PendingScheduleRequest[];
  onRespond: (payload: RespondRequestPayload) => void;
  isResponding: boolean;
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatShortDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDuration(minutes?: number): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export const ScheduleRequestsView: React.FC<ScheduleRequestsViewProps> = ({
  requests,
  onRespond,
  isResponding,
}) => {
  const { user } = useAppSelector(state => state.auth);

  if (requests.length === 0) {
    return (
      <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl text-center py-10">
        <CalendarIcon className="mx-auto text-zinc-600 mb-4" size={32} />
        <h3 className="text-lg font-semibold text-white">No Schedule Requests</h3>
        <p className="text-sm text-zinc-400 mt-2">You don't have any pending buddy study session requests.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        Pending Schedule Requests
        <span className="bg-[blueviolet] text-white text-xs px-2 py-0.5 rounded-full">
          {requests.length}
        </span>
      </h3>

      <div className="space-y-4 max-h-[480px] overflow-y-auto custom-scrollbar pr-2">
        <AnimatePresence initial={false}>
          {requests.map((req) => {
            const isSentByMe = req.proposedBy === user?.id;
            const isRecurring = req.recurringDates && req.recurringDates.length > 1;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={req.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3 hover:bg-white/10 transition-colors"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-sm font-semibold text-white">
                        <User size={13} className="text-zinc-400" />
                        {isSentByMe ? 'You' : req.proposerName || 'A Buddy'}
                      </span>
                      {isRecurring && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[blueviolet]/20 border border-[blueviolet]/30 text-[blueviolet] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <RotateCcw size={9} />
                          Recurring
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">proposed a study session</p>
                  </div>
                </div>

                {/* Session info */}
                {isRecurring && req.recurringDates ? (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Scheduled dates</p>
                    {req.recurringDates.slice(0, 3).map((date, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <CalendarIcon size={11} className="text-[blueviolet] shrink-0" />
                        <span className="text-zinc-200">{formatShortDate(date)}</span>
                        <span className="text-zinc-500">·</span>
                        <Clock size={11} className="text-orange-400 shrink-0" />
                        <span className="text-zinc-300">{formatTime(date)}</span>
                        {req.durationMinutes && (
                          <span className="text-zinc-500">({formatDuration(req.durationMinutes)})</span>
                        )}
                      </div>
                    ))}
                    {req.recurringDates.length > 3 && (
                      <p className="text-xs text-zinc-500 pl-4">+{req.recurringDates.length - 3} more session{req.recurringDates.length - 3 > 1 ? 's' : ''}</p>
                    )}
                    <p className="text-xs font-semibold text-[blueviolet] mt-1">
                      {req.recurringDates.length} total sessions
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-[blueviolet] bg-[blueviolet]/10 px-2 py-1 rounded-md font-medium">
                      <CalendarIcon size={11} />
                      {new Date(req.scheduledAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md font-medium">
                      <Clock size={11} />
                      {formatTime(req.scheduledAt)}
                    </span>
                    {req.durationMinutes && (
                      <span className="text-xs text-zinc-500">{formatDuration(req.durationMinutes)}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                {isSentByMe ? (
                  <div className="text-xs text-zinc-500 italic bg-black/20 px-3 py-1.5 rounded-lg border border-white/5 self-start">
                    Waiting for response...
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                    <button
                      disabled={isResponding}
                      onClick={() => onRespond({ requestId: req.id, status: 'REJECTED' })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors border border-red-500/20 disabled:opacity-50"
                    >
                      <X size={13} /> Decline
                    </button>
                    <button
                      disabled={isResponding}
                      onClick={() => onRespond({ requestId: req.id, status: 'CONFIRMED' })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold transition-colors border border-green-500/20 disabled:opacity-50"
                    >
                      <Check size={13} /> Accept
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
