import React from 'react';

interface BuddyNavbarProps {
  activeTab: 'find' | 'requests' | 'mybuddy' | 'blocked';
  onTabChange: (tab: 'find' | 'requests' | 'mybuddy' | 'blocked') => void;
}

export const BuddyNavbar: React.FC<BuddyNavbarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'find', label: 'Find Buddies' },
    { id: 'requests', label: 'Buddy Requests' },
    { id: 'mybuddy', label: 'My Buddy' },
  ] as const;

  return (
    <div className="flex bg-zinc-900 rounded-full p-1 border border-white/5 overflow-hidden w-fit shadow-2xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all duration-300 ${
            activeTab === tab.id
              ? 'bg-black text-white shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
