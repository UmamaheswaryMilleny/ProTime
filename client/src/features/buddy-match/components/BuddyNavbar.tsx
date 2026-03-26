import React from 'react';

interface BuddyNavbarProps {
  activeTab: 'find' | 'requests' | 'mybuddy' | 'blocked';
  onTabChange: (tab: 'find' | 'requests' | 'mybuddy' | 'blocked') => void;
  requestCount?: number;
}

interface Tab {
  id: 'find' | 'requests' | 'mybuddy' | 'blocked';
  label: string;
  count?: number;
}

export const BuddyNavbar: React.FC<BuddyNavbarProps> = ({ activeTab, onTabChange, requestCount = 0 }) => {
  const tabs: Tab[] = [
    { id: 'find', label: 'Find Buddies' },
    { id: 'requests', label: 'Buddy Requests', count: requestCount },
    { id: 'mybuddy', label: 'My Buddy' },
  ];

  return (
    <div className="flex bg-zinc-900 rounded-full p-1 border border-white/5 overflow-hidden w-fit shadow-2xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all duration-300 flex items-center gap-2 ${
            activeTab === tab.id
              ? 'bg-black text-white shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[blueviolet] text-[10px] text-white rounded-full">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
