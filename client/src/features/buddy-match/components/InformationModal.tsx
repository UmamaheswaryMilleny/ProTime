import React from 'react';
import { X, Info } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InformationModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[blueviolet]/10 flex items-center justify-center text-[blueviolet]">
            <Info size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">How Buddy Matching Works</h2>
        </div>

        <div className="space-y-4">
          {[
            "We match you based on skills, learning goals, and availability",
            "Higher match percentages indicate better compatibility",
            "Connect with buddies to start collaborative learning"
          ].map((text, i) => (
            <div key={i} className="flex gap-3">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[blueviolet] flex-shrink-0" />
              <p className="text-zinc-300 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
