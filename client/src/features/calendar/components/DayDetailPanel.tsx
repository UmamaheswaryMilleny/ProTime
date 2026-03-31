import { X, Clock, Video, CheckSquare, FileText, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DayDetail } from '../types/calendar.types';

interface DayDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  dayDetail: DayDetail | null;
  isLoading: boolean;
}

export const DayDetailPanel: React.FC<DayDetailPanelProps> = ({
  isOpen,
  onClose,
  dayDetail,
  isLoading,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full md:w-[400px] bg-zinc-900 border-l border-white/10 z-50 overflow-y-auto custom-scrollbar flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-zinc-900/90 backdrop-blur-md z-10">
              <div>
                <h3 className="text-xl font-bold text-white">Day Details</h3>
                <p className="text-sm text-zinc-400">
                  {dayDetail ? new Date(dayDetail.date).toLocaleDateString('default', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'Loading...'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-[blueviolet] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !dayDetail ? (
                <div className="flex-1 flex items-center justify-center text-zinc-500">
                  Select a day to view details
                </div>
              ) : (
                <>
                  {/* Sessions Section */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Video className="text-[blueviolet]" size={18} />
                      <h4 className="font-semibold text-white">Study Sessions</h4>
                      <span className="bg-white/10 text-zinc-300 text-xs px-2 py-0.5 rounded-full">
                        {dayDetail.events.filter(e => e.type === 'SESSION').length}
                      </span>
                    </div>

                    {dayDetail.events.filter(e => e.type === 'SESSION').length === 0 ? (
                      <p className="text-sm text-zinc-500 italic px-2">No sessions scheduled.</p>
                    ) : (
                      <div className="space-y-3">
                        {dayDetail.events
                          .filter(e => e.type === 'SESSION' && e.session)
                          .map((event) => {
                            const session = event.session!;
                            return (
                              <div key={session.id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider
                                    ${session.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                                      session.status === 'COMPLETED' ? 'bg-[blueviolet]/20 text-[blueviolet]' :
                                      'bg-zinc-800 text-zinc-400'}
                                  `}>
                                    {session.status}
                                  </span>
                                  <div className="flex items-center gap-1 text-xs text-zinc-400 font-medium">
                                    <Clock size={12} className="text-zinc-500" />
                                    {event.startTime}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[blueviolet]/10 border border-[blueviolet]/20 flex items-center justify-center text-[blueviolet] shrink-0">
                                    <User size={20} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-white">
                                      {event.buddy?.fullName || 'Buddy Session'}
                                    </p>
                                    <p className="text-xs text-zinc-500">Study Partner</p>
                                  </div>
                                </div>
                              </div>
                            );
                        })}
                      </div>
                    )}
                  </section>

                  <div className="h-px w-full bg-white/10" />

                  {/* Todos Section */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckSquare className="text-green-400" size={18} />
                      <h4 className="font-semibold text-white">To-Do Items</h4>
                      <span className="bg-white/10 text-zinc-300 text-xs px-2 py-0.5 rounded-full">
                        {dayDetail.events.filter(e => e.type === 'TASK').length}
                      </span>
                    </div>

                    {dayDetail.events.filter(e => e.type === 'TASK').length === 0 ? (
                      <p className="text-sm text-zinc-500 italic px-2">No tasks due.</p>
                    ) : (
                      <div className="space-y-3">
                        {dayDetail.events
                          .filter(e => e.type === 'TASK')
                          .map((todo) => (
                            <div key={todo.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
                              <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-sm border ${todo.isCompleted ? 'bg-green-500 border-green-500' : 'border-zinc-500'}`} />
                              <div>
                                <p className={`text-sm ${todo.isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                  {todo.title}
                                </p>
                              </div>
                            </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <div className="h-px w-full bg-white/10" />

                  {/* Notes Section */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="text-orange-400" size={18} />
                      <h4 className="font-semibold text-white">Session Notes</h4>
                      <span className="bg-white/10 text-zinc-300 text-xs px-2 py-0.5 rounded-full">
                        {dayDetail.events.filter(e => e.type === 'SESSION' && e.note).length}
                      </span>
                    </div>

                    {dayDetail.events.filter(e => e.type === 'SESSION' && e.note).length === 0 ? (
                      <p className="text-sm text-zinc-500 italic px-2">No notes available.</p>
                    ) : (
                      <div className="space-y-3">
                         {dayDetail.events
                           .filter(e => e.type === 'SESSION' && e.note)
                           .map((event) => (
                             <div key={event.note!.id} className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                               <p className="text-sm text-zinc-300 whitespace-pre-wrap">{event.note!.content}</p>
                             </div>
                         ))}
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
