import React, { useEffect, useState } from 'react';
import { HelpCircle, User, ArrowRight, ShieldOff } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchPreferences,
  savePreferences,
  fetchMatches,
  fetchBuddyList,
  fetchPendingRequests,
  fetchSentRequests,
  sendBuddyRequest,
  respondToBuddyRequest
} from '../store/buddySlice';
import { updateUser } from '../../auth/store/authSlice';
import { subscriptionService } from '../../dashboard/api/subscription-service';
import { BuddyNavbar } from '../components/BuddyNavbar';
import { BuddySearch } from '../components/BuddySearch';
import { BuddyCard } from '../components/BuddyCard';
import { BuddySidebar } from '../components/BuddySidebar';
import { UserInfoModal } from '../components/UserInfoModal';
import { InformationModal } from '../components/InformationModal';
import { BlockedUserCard } from '../components/BlockedUserCard';
import { ROUTES } from '../../../shared/constants/constants.routes';
import type { BuddyProfile, BuddyConnection } from '../types/buddy.types';
import { buddyService } from '../services/buddy.service';
import { chatApi } from '../../chat/api/chatApi';
import { setConversations } from '../../chat/store/chatSlice';
import { socketService } from '../../../shared/services/socketService';
import { toast } from 'react-hot-toast';
import { ConversationSidebar } from '../../chat/components/ConversationSidebar';
import { MessageWindow } from '../../chat/components/MessageWindow';

export const FindBuddyPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    preferences,
    matches,
    buddyList,
    pendingRequests,
    sentRequests,
    loading,
    error
  } = useAppSelector((state) => state.buddy);
  const totalMatches = useAppSelector(state => state.buddy.totalMatches);
  const isPremium = useAppSelector((state) => state.auth.user?.isPremium || false);
  const { conversations } = useAppSelector((state) => state.chat);

  const unreadMessagesCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  const getTabFromPath = (path: string, search: string) => {
    const params = new URLSearchParams(search);
    if (params.get('tab') === 'blocked') return 'blocked';
    if (params.get('tab') === 'messages') return 'messages';
    if (path === ROUTES.DASHBOARD_BUDDY_REQUESTS) return 'requests';
    if (path === ROUTES.DASHBOARD_MY_BUDDIES) return 'mybuddy';
    return 'find';
  };

  const [activeTab, setActiveTab] = useState<'find' | 'requests' | 'mybuddy' | 'blocked' | 'messages'>(() =>
    getTabFromPath(location.pathname, location.search)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<BuddyProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isGlobal, setIsGlobal] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<BuddyConnection[]>([]);
  const [unblockingIds, setUnblockingIds] = useState<Record<string, boolean>>({});
  const itemsPerPage = 10;

  // Sidebar minimize state and selected conversation state for Messages tab
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(() => localStorage.getItem('chat_sidebar_minimized') === 'true');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const queryParams = new URLSearchParams(location.search);
  const selectedConvId = queryParams.get('convId') || undefined;

  useEffect(() => {
    localStorage.setItem('chat_sidebar_minimized', isSidebarMinimized.toString());
  }, [isSidebarMinimized]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Automatically redirect to the last active conversation on desktop/tablet under messages tab
  useEffect(() => {
    if (activeTab === 'messages' && !selectedConvId && conversations.length > 0 && window.innerWidth >= 768) {
      const sorted = [...conversations].sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.createdAt).getTime();
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
      const lastActive = sorted[0];
      if (lastActive) {
        navigate(`/dashboard/find-buddy?tab=messages&convId=${lastActive.id}`, { replace: true });
      }
    }
  }, [activeTab, selectedConvId, conversations, navigate]);

  // For editing preferences in sidebar locally before applying
  const [editPrefs, setEditPrefs] = useState<any>(null);
  const [preferencesReady, setPreferencesReady] = useState(false);

  useEffect(() => {
    dispatch(fetchPreferences());
    dispatch(fetchBuddyList());
    dispatch(fetchPendingRequests());
    dispatch(fetchSentRequests());
    loadBlockedUsers();

    const fetchConvs = async () => {
      try {
        const res = await chatApi.getConversations();
        if (res.success) {
          dispatch(setConversations(res.data));
          const allIds = res.data.map(c => c.id);
          if (allIds.length > 0) {
            socketService.emit('join:conversations', allIds);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations on mount in FindBuddyPage:', err);
      }
    };
    fetchConvs();

    // Sync isPremium in case the JWT is stale after a recent payment
    subscriptionService.getSubscription()
      .then(sub => {
        if (sub?.isPremium && !isPremium) {
          dispatch(updateUser({ isPremium: true }));
        }
      })
      .catch(() => { }); // silently ignore if not authenticated yet
  }, [dispatch]);

  const loadBlockedUsers = async () => {
    try {
      const data = await buddyService.getBlockedUsers();
      setBlockedUsers(data);
    } catch { }
  };

  const handleBlock = async (targetUserId: string, displayName?: string) => {
    // Show confirmation toast with Yes / No
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-white">
          Block {displayName ? `@${displayName}` : 'this user'}?
        </p>
        <p className="text-xs text-zinc-400">They won't be able to send you requests or appear in your matches.</p>
        <div className="flex gap-2 mt-1">
          <button
            className="flex-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await buddyService.blockUser(targetUserId);
                toast.success('User blocked');
                dispatch(fetchBuddyList());
                loadBlockedUsers();
              } catch (err: any) {
                toast.error(err?.message || 'Failed to block user');
              }
            }}
          >
            Yes, Block
          </button>
          <button
            className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 10000, style: { background: '#18181B', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', maxWidth: '320px' } });
  };

  const handleUnblock = (connectionId: string, displayName?: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-white">
          Unblock {displayName ? `@${displayName}` : 'this user'}?
        </p>
        <p className="text-xs text-zinc-400">They'll be able to appear in matches and send you requests again.</p>
        <div className="flex gap-2 mt-1">
          <button
            className="flex-1 px-3 py-1.5 rounded-lg bg-[blueviolet] hover:bg-[#7c2ae8] text-white text-xs font-bold transition-colors"
            onClick={async () => {
              toast.dismiss(t.id);
              setUnblockingIds(prev => ({ ...prev, [connectionId]: true }));
              try {
                await buddyService.unblockUser(connectionId);
                toast.success('User unblocked');
                setBlockedUsers(prev => prev.filter(b => b.id !== connectionId));
              } catch (err: any) {
                toast.error(err?.message || 'Failed to unblock user');
              } finally {
                setUnblockingIds(prev => ({ ...prev, [connectionId]: false }));
              }
            }}
          >
            Yes, Unblock
          </button>
          <button
            className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 10000, style: { background: '#18181B', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', maxWidth: '320px' } });
  };

  // Debounced search & Global toggle effect — also runs when preferences first load or are updated
  useEffect(() => {
    if (activeTab !== 'find') return;
    if (!preferencesReady) return; // wait until preferences have been fetched

    const handler = setTimeout(() => {
      setCurrentPage(1);
      dispatch(fetchMatches({
        page: 1,
        limit: itemsPerPage,
        search: searchQuery,
        global: isGlobal
      }));
    }, 300);

    return () => clearTimeout(handler);
  // NOTE: `preferences` is intentionally included so that saving new preferences
  // automatically triggers a fresh match fetch without requiring a manual page refresh.
  }, [searchQuery, isGlobal, activeTab, preferencesReady, preferences, dispatch]);

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname, location.search));
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (preferences) {
      setEditPrefs(preferences);
      setPreferencesReady(true); // trigger the match fetch
    }
  }, [preferences]);

  useEffect(() => {
    if (error && !error.toLowerCase().includes('limit') && !error.toLowerCase().includes('quota')) {
      toast.error(error);
    }
  }, [error]);

  const handleApplyPreferences = async (data?: any) => {
    try {
      const prefsToSave = data || editPrefs;
      await dispatch(savePreferences(prefsToSave)).unwrap();
      toast.success('Preferences updated!');
      // The debounced useEffect watches `preferences` in its dependency array and will
      // automatically re-fetch matches once Redux updates with the new preferences.
      // No manual fetchMatches dispatch needed here.
    } catch (err) { }
  };


  const getBuddyStatus = (buddyId: string) => {
    if (buddyList.some(conn => conn.buddy?.userId === buddyId)) return 'CONNECTED';
    if (pendingRequests.some(conn => conn.buddy?.userId === buddyId)) return 'PENDING';
    if (sentRequests.some((conn: any) => conn.receiverId === buddyId)) return 'SENT';
    return 'NONE';
  };

  const handleSendRequest = async (buddyId: string) => {
    try {
      await dispatch(sendBuddyRequest(buddyId)).unwrap();
      toast.success('Friend request sent!');
      dispatch(fetchSentRequests()); // Refresh sent requests
      setSelectedBuddy(null);
    } catch (err: any) {
      if (err?.toLowerCase().includes('limit') || err?.toLowerCase().includes('quota')) {
        toast.error(
          isPremium
            ? "You've reached your daily limit for new connections."
            : "You've reached the free daily limit. Upgrade to Pro for more!"
        );
      } else {
        toast.error(err || 'Failed to send request');
      }
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      await dispatch(respondToBuddyRequest({ connectionId, status: 'CONNECTED' })).unwrap();
      toast.success('Buddy request accepted!');
      dispatch(fetchBuddyList());
      dispatch(fetchPendingRequests());
      setSelectedBuddy(null);
    } catch (err: any) {
      toast.error(err || 'Failed to accept request');
    }
  };

  const handleOpenChat = async (connectionId: string, buddyUserId: string) => {
    try {
      const loadingId = toast.loading('Opening chat...');
      const result = await chatApi.getConversations();
      toast.dismiss(loadingId);
      const conv = result.data.find(c => c.buddyConnectionId === connectionId || c.otherUser.userId === buddyUserId);
      if (conv) {
        navigate(`/dashboard/find-buddy?tab=messages&convId=${conv.id}`, { state: { from: location.pathname + location.search } });
      } else {
        toast.error('Check your messages; chat could not be found right now.', { icon: '🥲' });
        navigate(`/dashboard/find-buddy?tab=messages`, { state: { from: location.pathname + location.search } });
      }
    } catch (error) {
      toast.error('Failed to load chat');
    }
  };

  if (activeTab === 'messages') {
    const activeMinimized = isSidebarMinimized && !isMobile;

    return (
      <div className="flex h-[calc(100vh-32px)] sm:h-[calc(100vh-48px)] lg:h-[calc(100vh-64px)] w-full bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
        <div className={`transition-all duration-300 border-r border-white/5 ${selectedConvId ? 'hidden md:block' : 'block'} w-full flex-shrink-0 ${activeMinimized ? 'md:w-24' : 'md:w-1/3 max-w-sm'}`}>
          <ConversationSidebar 
            isMinimized={activeMinimized} 
            onToggle={() => setIsSidebarMinimized(!isSidebarMinimized)} 
            activeConversationId={selectedConvId}
            onSelectConversation={(id) => navigate(`${location.pathname}?tab=messages&convId=${id}`, { state: location.state })}
            onBack={() => {
              const fallbackPath = location.state?.from || ROUTES.DASHBOARD_FIND_BUDDY;
              navigate(fallbackPath);
            }}
          />
        </div>

        {/* Message window */}
        <div className={`flex-1 flex flex-col ${!selectedConvId ? 'hidden md:flex' : 'flex'} h-full bg-transparent`}>
          {selectedConvId ? (
            <div className="flex flex-col flex-1 h-full relative">
              <div className="flex-1 min-h-0 flex flex-col">
                <MessageWindow conversationId={selectedConvId} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 lg:p-12 lg:pb-12">
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-white mb-3">Find Your Study Buddy</h1>
        <p className="text-zinc-500 text-base">Connect With Like-Minded Learners Who Share Your Goals</p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4 w-full overflow-hidden">
          <div className="bg-[#18181B] rounded-full p-1 border border-white/5 flex items-center overflow-x-auto max-w-full scrollbar-none whitespace-nowrap">
            <BuddyNavbar
              activeTab={activeTab}
              onTabChange={(tab) => {
                if (tab === 'find') navigate(ROUTES.DASHBOARD_FIND_BUDDY);
                else if (tab === 'requests') navigate(ROUTES.DASHBOARD_BUDDY_REQUESTS);
                else if (tab === 'mybuddy') navigate(ROUTES.DASHBOARD_MY_BUDDIES);
                else if (tab === 'messages') navigate(`${ROUTES.DASHBOARD_FIND_BUDDY}?tab=messages`, { state: { from: location.pathname + location.search } });
              }}
              requestCount={pendingRequests.length}
              unreadMessagesCount={unreadMessagesCount}
            />
            {/* Blocked tab */}
            <button
              onClick={() => navigate(`${ROUTES.DASHBOARD_FIND_BUDDY}?tab=blocked`)}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'blocked'
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <ShieldOff size={12} />
              Blocked
              {blockedUsers.length > 0 && (
                <span className="ml-0.5 bg-red-500/30 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {blockedUsers.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {activeTab === 'find' && (
            <div className="flex items-center gap-3 bg-[#18181B] border border-white/5 px-4 py-2.5 rounded-full">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Search</span>
              <button
                onClick={() => setIsGlobal(!isGlobal)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${isGlobal ? 'bg-[blueviolet]' : 'bg-zinc-700'}`}
              >
                <div className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${isGlobal ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          )}

          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors flex-shrink-0"
          >
            <HelpCircle size={20} />
          </button>
        </div>
      </div>

      {activeTab === 'find' && (
        <div className="mb-10 max-w-2xl">
          <BuddySearch value={searchQuery} onChange={setSearchQuery} />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {!preferences && activeTab === 'find' ? (
          <div className="flex-1 flex flex-col items-center justify-center py-32 bg-zinc-900/50 rounded-[40px] border border-white/5 text-center px-6">
            <div className="w-20 h-20 rounded-3xl bg-[blueviolet]/10 flex items-center justify-center mb-6">
              <User size={40} className="text-[blueviolet]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Set up your preferences</h2>
            <p className="text-zinc-400 mb-8 max-w-md text-lg">Set up your buddy preferences in your profile to start finding study buddies who match your goals.</p>
            <Link
              to={ROUTES.USER_PROFILE}
              className="px-8 py-3 bg-[blueviolet] hover:bg-[#7c2ae8] text-white rounded-2xl font-semibold transition-all shadow-lg shadow-[blueviolet]/20 flex items-center gap-2 group"
            >
              Go to Profile <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <>
            {/* Sidebar — only visible on the Find tab */}
            {activeTab === 'find' && (
              <BuddySidebar
                preferences={editPrefs}
                isPremium={isPremium}
                onApply={handleApplyPreferences}
                onChange={setEditPrefs}
                isSaving={loading.preferences}
              />
            )}

            {/* Content Area */}
            <div className="flex-1">
              {activeTab === 'find' && (
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[blueviolet] animate-pulse" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      {totalMatches} {totalMatches === 1 ? 'Potential Buddy' : 'Potential Buddies'} Found
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'find' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {loading.matches && matches.length === 0 ? (
                    <p className="text-zinc-500 col-span-full py-10 text-center">Finding matches...</p>
                  ) : matches.length > 0 ? (
                    matches.map(buddy => (
                      <BuddyCard
                        key={buddy.userId}
                        buddy={buddy}
                        status={getBuddyStatus(buddy.userId)}
                        isLoading={loading.actions[buddy.userId]}
                        onAction={(action) => {
                          if (action === 'view') setSelectedBuddy(buddy);
                          if (action === 'send') handleSendRequest(buddy.userId);
                          if (action === 'block') handleBlock(buddy.userId, buddy.username || buddy.fullName);
                        }}
                      />
                    ))
                  ) : !loading.matches && (
                    <div className="col-span-full py-20 text-center bg-zinc-900/20 rounded-[40px] border border-dashed border-white/10 flex flex-col items-center gap-4">
                      <p className="text-zinc-500">No buddies found matching your criteria.</p>
                      <Link
                        to={ROUTES.USER_PROFILE}
                        className="text-[blueviolet] hover:underline flex items-center gap-2"
                      >
                        Update Preferences <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'find' && totalMatches > itemsPerPage && (() => {
                const totalPages = Math.ceil(totalMatches / itemsPerPage);
                
                // Helper to generate the array of pages to show
                const getPageNumbers = () => {
                  const pages: (number | string)[] = [];
                  const delta = 1; // Number of pages to show before and after current page

                  // Always include page 1
                  pages.push(1);

                  let rangeStart = Math.max(2, currentPage - delta);
                  let rangeEnd = Math.min(totalPages - 1, currentPage + delta);

                  // Adjust range if current page is near the start or end
                  if (currentPage <= 2) {
                    rangeEnd = Math.min(totalPages - 1, 4);
                  }
                  if (currentPage >= totalPages - 1) {
                    rangeStart = Math.max(2, totalPages - 3);
                  }

                  if (rangeStart > 2) {
                    pages.push('...');
                  }

                  for (let i = rangeStart; i <= rangeEnd; i++) {
                    pages.push(i);
                  }

                  if (rangeEnd < totalPages - 1) {
                    pages.push('...');
                  }

                  // Always include the last page if there's more than 1 page
                  if (totalPages > 1) {
                    pages.push(totalPages);
                  }

                  return pages;
                };

                const pageNumbers = getPageNumbers();

                return (
                  <div className="mt-12 flex flex-col items-center gap-6">
                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-2 p-1.5 bg-[#18181B] border border-white/5 rounded-2xl">
                      <button
                        onClick={() => {
                          const prev = Math.max(1, currentPage - 1);
                          setCurrentPage(prev);
                          dispatch(fetchMatches({ page: prev, limit: itemsPerPage, search: searchQuery, global: isGlobal }));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === 1 || loading.matches}
                        className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
                      >
                        <ArrowRight size={18} className="rotate-180" />
                      </button>

                      {pageNumbers.map((pageNum, idx) => {
                        if (pageNum === '...') {
                          return (
                            <span key={`dots-${idx}`} className="text-zinc-600 px-2 font-bold select-none">
                              ...
                            </span>
                          );
                        }
                        
                        const isCurrent = currentPage === pageNum;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setCurrentPage(pageNum as number);
                              dispatch(fetchMatches({ page: pageNum as number, limit: itemsPerPage, search: searchQuery, global: isGlobal }));
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={loading.matches}
                            className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                              isCurrent
                                ? 'bg-[blueviolet] text-white shadow-lg shadow-[blueviolet]/20'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => {
                          const next = Math.min(totalPages, currentPage + 1);
                          setCurrentPage(next);
                          dispatch(fetchMatches({ page: next, limit: itemsPerPage, search: searchQuery, global: isGlobal }));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === totalPages || loading.matches}
                        className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </div>

                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                      Page {currentPage} of {totalPages}
                    </p>
                  </div>
                );
              })()}

              {activeTab === 'requests' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map(conn => (
                      <BuddyCard
                        key={conn.id}
                        buddy={conn.buddy!}
                        status="PENDING"
                        isLoading={loading.actions[conn.id]}
                        onAction={async (action) => {
                          if (action === 'view') setSelectedBuddy(conn.buddy!);
                          if (action === 'block' && conn.buddy?.userId)
                            handleBlock(conn.buddy.userId, conn.buddy.username || conn.buddy.fullName);
                          if (action === 'accept' || action === 'decline') {
                            try {
                              const status = action === 'accept' ? 'CONNECTED' : 'DECLINED';
                              await dispatch(respondToBuddyRequest({ connectionId: conn.id, status })).unwrap();
                              toast.success(action === 'accept' ? 'Buddy request accepted!' : 'Request declined');
                              dispatch(fetchBuddyList());
                              dispatch(fetchPendingRequests());
                            } catch (err: any) {
                              toast.error(err || 'Failed to respond to request');
                            }
                          }
                        }}
                      />
                    ))
                  ) : (
                    <p className="text-zinc-500 col-span-full py-10 text-center">No pending requests.</p>
                  )}
                </div>
              )}

              {activeTab === 'mybuddy' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {buddyList.length > 0 ? (
                    buddyList.map(conn => (
                      <BuddyCard
                        key={conn.id}
                        buddy={conn.buddy!}
                        status="CONNECTED"
                        onAction={(action) => {
                          if (action === 'view') setSelectedBuddy(conn.buddy!);
                          if (action === 'block' && conn.buddy?.userId)
                            handleBlock(conn.buddy.userId, conn.buddy.username || conn.buddy.fullName);
                          if (action === 'chat') {
                            handleOpenChat(conn.id, conn.buddy?.userId || '');
                          }
                        }}
                      />
                    ))
                  ) : (
                    <p className="text-zinc-500 col-span-full py-10 text-center">No buddies connected yet.</p>
                  )}
                </div>
              )}


              {activeTab === 'blocked' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldOff size={16} className="text-red-400" />
                    <h3 className="text-sm font-semibold text-zinc-400">Blocked Users</h3>
                    <span className="text-xs text-zinc-600">({blockedUsers.length})</span>
                  </div>
                  {blockedUsers.length > 0 ? (
                    blockedUsers.map(conn => (
                      <BlockedUserCard
                        key={conn.id}
                        connection={conn}
                        isUnblocking={unblockingIds[conn.id]}
                        onUnblock={handleUnblock}
                      />
                    ))
                  ) : (
                    <div className="py-20 text-center bg-zinc-900/20 rounded-[40px] border border-dashed border-white/10 flex flex-col items-center gap-3">
                      <ShieldOff size={36} className="text-zinc-700" />
                      <p className="text-zinc-500">You haven't blocked anyone yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <UserInfoModal
        buddy={selectedBuddy}
        isOpen={!!selectedBuddy}
        onClose={() => setSelectedBuddy(null)}
        onConnect={() => selectedBuddy && handleSendRequest(selectedBuddy.userId)}
        onAccept={() => {
          if (selectedBuddy) {
            const conn = pendingRequests.find(c => c.buddy?.userId === selectedBuddy.userId);
            if (conn) handleAcceptRequest(conn.id);
          }
        }}
        onChat={() => {
          if (selectedBuddy) {
            const conn = buddyList.find(c => c.buddy?.userId === selectedBuddy.userId);
            handleOpenChat(conn?.id || '', selectedBuddy.userId);
          }
        }}
        status={selectedBuddy ? getBuddyStatus(selectedBuddy.userId) : 'NONE'}
        isLoading={
          selectedBuddy
            ? (loading.actions[selectedBuddy.userId] ||
               loading.actions[pendingRequests.find(c => c.buddy?.userId === selectedBuddy.userId)?.id || ''])
            : false
        }
      />

      <InformationModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
};
