import React from "react";
import { MessageSquare } from "lucide-react";

export const ReputationWidget: React.FC = () => {
  return (
    <div className="bg-zinc-900 rounded-3xl p-6 border border-white/5 text-center">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="text-[blueviolet]" size={20} />
        <h2 className="text-lg font-bold text-white">Reputation & Feedback</h2>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <div className="mb-4">
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="yellow"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              stroke="yellow"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="text-zinc-400 text-xs leading-relaxed max-w-[200px] mx-auto">
          Your Feedback And Ratings Will Appear Here After Your First Session.
        </p>
      </div>
    </div>
  );
};
