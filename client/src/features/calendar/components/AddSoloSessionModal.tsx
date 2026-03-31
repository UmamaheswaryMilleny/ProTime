import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Clock, Edit2, AlertCircle } from 'lucide-react';
import { getTodayLocalDate } from '../../../shared/utils/dateUtils';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { createSoloEvent } from '../store/calendarSlice';
import { toast } from 'react-hot-toast';

interface AddSoloSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string | null;
}

export const AddSoloSessionModal: React.FC<AddSoloSessionModalProps> = ({ 
  isOpen, 
  onClose,
  defaultDate
}) => {
  const dispatch = useAppDispatch();
  const { isCreatingSoloEvent } = useAppSelector((state) => state.calendar);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate || getTodayLocalDate());
  const [startTime, setStartTime] = useState('12:00');

  // Time conversion helper for 12h display
  const formattedTime12h = React.useMemo(() => {
    const [h = 0, m = 0] = startTime.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  }, [startTime]);

  // Validation for past time
  const timeError = React.useMemo(() => {
    if (!date || !startTime) return null;
    const today = getTodayLocalDate();
    if (date < today) return 'Date cannot be in the past';
    
    if (date === today) {
      const now = new Date();
      const [h, m] = startTime.split(':').map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(h, m, 0, 0);
      
      if (selectedTime.getTime() <= now.getTime()) {
        return 'Time must be in the future for today';
      }
    }
    return null;
  }, [date, startTime]);

  // Reset local state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDate(defaultDate || getTodayLocalDate());
      
      // If today is chosen, set a default time that is at least 1 hour in the future
      const today = getTodayLocalDate();
      if (!defaultDate || defaultDate === today) {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        setStartTime(`${h}:${m}`);
      } else {
        setStartTime('12:00');
      }
    }
  }, [isOpen, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timeError) {
      toast.error(timeError);
      return;
    }
    if (!title.trim() || !date || !startTime) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      await dispatch(createSoloEvent({ title, date, startTime })).unwrap();
      toast.success('Solo session scheduled successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error || 'Failed to schedule solo session.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="p-2 bg-[blueviolet]/20 rounded-lg text-[blueviolet]">
                    <CalendarIcon size={20} />
                  </div>
                  Schedule Solo Session
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <Edit2 size={14} /> Session Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Deep Work: System Design"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[blueviolet]/50 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <CalendarIcon size={14} /> Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      min={getTodayLocalDate()}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[blueviolet]/50 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <Clock size={14} /> Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={`w-full bg-black/50 border rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[blueviolet]/50 focus:border-transparent transition-all ${
                        timeError ? 'border-red-500' : 'border-white/10'
                      }`}
                    />
                  </div>
                </div>

                {timeError && (
                  <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    <AlertCircle size={14} />
                    {timeError}
                  </div>
                )}

                {!timeError && title.trim() && (
                  <div className="bg-[blueviolet]/5 border border-[blueviolet]/20 rounded-2xl p-4 space-y-2">
                    <p className="text-[10px] font-bold text-[blueviolet] uppercase tracking-wider">Schedule Preview</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Time:</span>
                      <span className="text-white font-medium">{formattedTime12h}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Date:</span>
                      <span className="text-white font-medium">{date}</span>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-zinc-300 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingSoloEvent || !title.trim() || !date || !startTime || !!timeError}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-[blueviolet] hover:bg-opacity-90 transition-all duration-200 shadow-[0_0_20px_rgba(138,43,226,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isCreatingSoloEvent ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Schedule'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
