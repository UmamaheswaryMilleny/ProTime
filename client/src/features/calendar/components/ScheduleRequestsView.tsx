import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import type { PendingScheduleRequest, RespondRequestPayload } from '../types/calendar.types';
import { useAppSelector } from '../../../store/hooks';

interface ScheduleRequestsViewProps {
  requests: PendingScheduleRequest[];
  onRespond: (payload: RespondRequestPayload) => void;
  isResponding: boolean;
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

      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {requests.map((req) => {
          const isSentByMe = req.proposedBy === user?.id;
          const dateObj = new Date(req.scheduledAt);
          
          return (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={req.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm text-zinc-300">
                  <span className="font-semibold text-white">
                    {isSentByMe ? 'You' : req.proposerName || 'A Buddy'}
                  </span>{' '}
                  proposed a study session
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-xs text-[blueviolet] bg-[blueviolet]/10 px-2 py-1 rounded-md font-medium">
                    <CalendarIcon size={12} />
                    {dateObj.toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md font-medium">
                    <Clock size={12} />
                    {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {isSentByMe ? (
                <div className="text-xs text-zinc-500 italic bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                  Waiting for response...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    disabled={isResponding}
                    onClick={() => onRespond({ requestId: req.id, status: 'REJECTED' })}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors border border-red-500/20 disabled:opacity-50"
                  >
                    <X size={18} />
                  </button>
                  <button
                    disabled={isResponding}
                    onClick={() => onRespond({ requestId: req.id, status: 'CONFIRMED' })}
                    className="p-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-500 transition-colors border border-green-500/20 disabled:opacity-50"
                  >
                    <Check size={18} />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
