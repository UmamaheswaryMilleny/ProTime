import React from 'react';
import { BuddyPreferenceForm } from './BuddyPreferenceForm';

interface BuddySidebarProps {
  preferences: any;
  isPremium: boolean;
  onApply: (data?: any) => void;
  onChange?: (data: any) => void;
  isSaving?: boolean;
}

export const BuddySidebar: React.FC<BuddySidebarProps> = ({ 
  preferences, 
  isPremium, 
  onApply,
  onChange,
  isSaving = false,
}) => {
  return (
    <div className="w-full lg:w-[320px] flex-shrink-0">
      <div className="bg-[#18181B] border border-white/5 rounded-[24px] p-6">
        <h2 className="text-white font-bold text-base mb-6">My Preferences</h2>
        <BuddyPreferenceForm 
          section="all"
          initialData={preferences}
          isPremium={isPremium}
          onChange={onChange}
          onSave={async (data) => onApply(data)}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
};
