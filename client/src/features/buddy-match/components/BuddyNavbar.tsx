import React from 'react';

interface BuddyNavbarProps {
  activeTab: 'find' | 'requests' | 'mybuddy' | 'blocked' | 'messages';
  onTabChange: (tab: 'find' | 'requests' | 'mybuddy' | 'blocked' | 'messages') => void;
  requestCount?: number;
  unreadMessagesCount?: number;
}

interface Tab {
  id: 'find' | 'requests' | 'mybuddy' | 'messages';
  label: string;
  count?: number;
}

export const BuddyNavbar: React.FC<BuddyNavbarProps> = ({ 
  activeTab, 
  onTabChange, 
  requestCount = 0,
  unreadMessagesCount = 0
}) => {
  const tabs: Tab[] = [
    { id: 'find', label: 'Find' },
    { id: 'requests', label: 'Requests', count: requestCount },
    { id: 'mybuddy', label: 'Buddies' },
    { id: 'messages', label: 'Messages', count: unreadMessagesCount },
  ];

  return (
    <div className="flex bg-zinc-900 rounded-full p-1 border border-white/5 w-fit shadow-2xl flex-shrink-0 whitespace-nowrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all duration-300 flex items-center gap-2 flex-shrink-0 ${
            activeTab === tab.id
              ? 'bg-black text-white shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] text-white rounded-full ${
              tab.id === 'messages' ? 'bg-red-500' : 'bg-[blueviolet]'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
