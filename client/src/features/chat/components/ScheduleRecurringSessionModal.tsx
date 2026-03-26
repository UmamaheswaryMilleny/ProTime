import React, { useState } from 'react';
import { X } from 'lucide-react';
import { chatApi } from '../api/chatApi';
import toast from 'react-hot-toast';

interface ScheduleRecurringSessionModalProps {
  conversationId: string;
  onClose: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const ScheduleRecurringSessionModal: React.FC<ScheduleRecurringSessionModalProps> = ({ conversationId, onClose }) => {
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday']);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('14:00');
  const [noOfSessions, setNoOfSessions] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSendRequest = async () => {
    if (selectedDays.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    try {
      setIsSubmitting(true);
      await chatApi.proposeRecurringSession(conversationId, {
        days: selectedDays,
        startTime,
        endTime,
        noOfSessions
      });
      toast.success('Session schedule request sent!');
      onClose();
    } catch (error) {
      console.error('Failed to send schedule request:', error);
      toast.error('Failed to send schedule request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl p-8 flex flex-col">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2 leading-tight">Schedule Recurring Buddy Session</h2>
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          Plan your next study session with your buddy on multiple days so you don't need to rematch again!
        </p>

        <div className="space-y-8">
          {/* Choose Days */}
          <div>
            <label className="text-sm font-bold text-zinc-200 block mb-4 uppercase tracking-wider">Choose Days</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
              {DAYS.map(day => (
                <label key={day} className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox"
                      checked={selectedDays.includes(day)}
                      onChange={() => toggleDay(day)}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-zinc-700 bg-zinc-800 transition-all checked:bg-[blueviolet] checked:border-[blueviolet] hover:border-zinc-500"
                    />
                    <svg
                      className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Start Time */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Start Time</label>
              <input 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/40 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-[blueviolet] focus:ring-1 focus:ring-[blueviolet] transition-all"
              />
            </div>

            {/* No of Sessions */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-200 uppercase tracking-wider">No of Sessions</label>
              <input 
                type="number" 
                min="1"
                value={noOfSessions}
                onChange={(e) => setNoOfSessions(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 bg-zinc-800/40 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-[blueviolet] focus:ring-1 focus:ring-[blueviolet] transition-all"
                placeholder="2"
              />
            </div>

            {/* End Time */}
            <div className="col-span-1 space-y-2">
              <label className="text-sm font-bold text-zinc-200 uppercase tracking-wider">End Time</label>
              <input 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/40 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-[blueviolet] focus:ring-1 focus:ring-[blueviolet] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex gap-4">
          <button
            onClick={handleSendRequest}
            disabled={isSubmitting}
            className="flex-1 bg-[blueviolet] hover:bg-[blueviolet]/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[blueviolet]/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-transparent border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300 font-bold py-3.5 rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
