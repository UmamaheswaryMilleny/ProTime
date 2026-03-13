import React from 'react';
import { X, MapPin, Target, Clock, Zap } from 'lucide-react';
import type { BuddyProfile } from '../types/buddy.types';

interface UserInfoModalProps {
  buddy: BuddyProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  isLoading?: boolean;
}

export const UserInfoModal: React.FC<UserInfoModalProps> = ({ 
  buddy, 
  isOpen, 
  onClose,
  onConnect,
  isLoading
}) => {
  if (!isOpen || !buddy) return null;

  const avatarUrl = buddy.profileImage || buddy.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(buddy.fullName)}&background=8A2BE2&color=fff`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="bg-zinc-900 border border-white/5 rounded-[32px] w-full max-w-md overflow-hidden relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header Cover */}
        <div className="h-28 bg-gradient-to-br from-[blueviolet] to-[#4b0082] relative">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all backdrop-blur-md flex items-center justify-center border border-white/10"
            >
                <X size={16} />
            </button>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-8 -mt-12 relative text-center sm:text-left">
            <div className="relative inline-block mb-4">
                <img 
                    src={avatarUrl} 
                    alt={buddy.fullName} 
                    className="w-24 h-24 rounded-full border-4 border-zinc-900 object-cover shadow-2xl"
                />
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full" />
            </div>

            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                    <h2 className="text-xl font-bold text-white tracking-tight">{buddy.fullName}</h2>
                    <span className="inline-block self-center sm:self-auto bg-[blueviolet]/10 text-[blueviolet] text-[9px] font-bold px-2 py-0.5 rounded-lg border border-[blueviolet]/20">TOP LEARNER</span>
                </div>
                <p className="text-zinc-500 text-sm font-medium">@{buddy.username || buddy.fullName.toLowerCase().replace(/\s+/g, '_')}</p>
                
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2 text-zinc-400 text-sm">
                    <MapPin size={14} className="text-[blueviolet]" /> {buddy.country}
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div>
                    <h4 className="text-white font-bold text-xs mb-2 flex items-center justify-center sm:justify-start gap-2">
                        <Zap size={14} className="text-yellow-500" /> About Me
                    </h4>
                    <p className="text-zinc-400 text-[13px] leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5 italic">
                        "{buddy.bio || "Hello! I'm excited to find a study buddy and work towards our shared goals together."}"
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <h4 className="text-zinc-600 text-[9px] font-bold uppercase mb-0.5 flex items-center gap-1">
                            <Target size={10} /> Goal
                        </h4>
                        <p className="text-zinc-200 text-xs font-semibold truncate">{buddy.studyGoal}</p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <h4 className="text-zinc-600 text-[9px] font-bold uppercase mb-0.5 flex items-center gap-1">
                            <Clock size={10} /> Freq
                        </h4>
                        <p className="text-zinc-200 text-xs font-semibold truncate">{buddy.frequency}</p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <h4 className="text-zinc-600 text-[9px] font-bold uppercase mb-0.5">Language</h4>
                        <p className="text-zinc-200 text-xs font-semibold truncate">{buddy.studyLanguage}</p>
                    </div>
                    {buddy.subjectDomain && (
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                            <h4 className="text-zinc-600 text-[9px] font-bold uppercase mb-0.5">Domain</h4>
                            <p className="text-zinc-200 text-xs font-semibold truncate">{buddy.subjectDomain}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-3">
                <button 
                   onClick={onClose}
                   className="flex-1 border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-wider"
                >
                    Cancel
                </button>
                <button 
                    disabled={isLoading}
                    onClick={onConnect}
                    className="flex-1 bg-[blueviolet] hover:bg-[#7c2ae8] text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-[blueviolet]/20 disabled:opacity-50 text-xs uppercase tracking-wider active:scale-95"
                >
                    {isLoading ? '...' : 'Send Request'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
