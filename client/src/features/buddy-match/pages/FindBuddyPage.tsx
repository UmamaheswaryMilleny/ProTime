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
// import { BuddySearch } from '../components/BuddySearch';
import { BuddyCard } from '../components/BuddyCard';
import { BuddySidebar } from '../components/BuddySidebar';
import { UserInfoModal } from '../components/UserInfoModal';
import { InformationModal } from '../components/InformationModal';
import { BlockedUserCard } from '../components/BlockedUserCard';
import { ROUTES } from '../../../shared/constants/constants.routes';
import type { BuddyProfile, BuddyConnection } from '../types/buddy.types';
import { buddyService } from '../services/buddy.service';
import { chatApi } from '../../chat/api/chatApi';
import { toast } from 'react-hot-toast';

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

  const getTabFromPath = (path: string) => {
    if (path === ROUTES.DASHBOARD_BUDDY_REQUESTS) return 'requests';
    if (path === ROUTES.DASHBOARD_MY_BUDDIES) return 'mybuddy';
    return 'find';
  };

  const [activeTab, setActiveTab] = useState<'find' | 'requests' | 'mybuddy' | 'blocked'>(getTabFromPath(location.pathname));
  const [searchQuery] = useState('');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<BuddyProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isGlobal, setIsGlobal] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<BuddyConnection[]>([]);
  const [unblockingIds, setUnblockingIds] = useState<Record<string, boolean>>({});
  const itemsPerPage = 10;

  // For editing preferences in sidebar locally before applying
  const [editPrefs, setEditPrefs] = useState<any>(null);
  const [preferencesReady, setPreferencesReady] = useState(false);

  useEffect(() => {
    dispatch(fetchPreferences());
    dispatch(fetchBuddyList());
    dispatch(fetchPendingRequests());
    dispatch(fetchSentRequests());
    loadBlockedUsers();

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

  // Debounced search & Global toggle effect — also runs when preferences first load
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
  }, [searchQuery, isGlobal, activeTab, preferencesReady, dispatch]);

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

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
      setCurrentPage(1);
      dispatch(fetchMatches({ page: 1, limit: itemsPerPage, search: searchQuery, global: isGlobal }));
    } catch (err) { }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    dispatch(fetchMatches({
      page: nextPage,
      limit: itemsPerPage,
      search: searchQuery,
      global: isGlobal
    }));
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

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 lg:p-12 lg:pb-12">
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-white mb-3">Find Your Study Buddy</h1>
        <p className="text-zinc-500 text-base">Connect With Like-Minded Learners Who Share Your Goals</p>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-12">
        <div className="flex items-center flex-1 max-w-4xl gap-4">
          {/* <div className="relative flex-1">
            <BuddySearch value={searchQuery} onChange={setSearchQuery} />
          </div> */}

          <div className="flex items-center gap-4">
            <div className="bg-[#18181B] rounded-full p-1 border border-white/5 flex items-center">
              <BuddyNavbar
                activeTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab)}
              />
              {/* Blocked tab */}
              <button
                onClick={() => setActiveTab('blocked')}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
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
            {/* Sidebar */}
            <BuddySidebar
              preferences={editPrefs}
              isPremium={isPremium}
              onApply={handleApplyPreferences}
              onChange={setEditPrefs}
              isSaving={loading.preferences}
            />

            {/* Content Area */}
            <div className="flex-1">
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

              {activeTab === 'find' && matches.length < totalMatches && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading.matches}
                    className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-semibold transition-all border border-white/5 disabled:opacity-50"
                  >
                    {loading.matches ? 'Loading...' : 'Load More Buddies'}
                  </button>
                </div>
              )}

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
                        onAction={async (action) => {
                          if (action === 'view') setSelectedBuddy(conn.buddy!);
                          if (action === 'block' && conn.buddy?.userId)
                            handleBlock(conn.buddy.userId, conn.buddy.username || conn.buddy.fullName);
                          if (action === 'chat') {
                            try {
                              const loadingId = toast.loading('Opening chat...');
                              const result = await chatApi.getConversations();
                              toast.dismiss(loadingId);
                              const conv = result.data.find(c => c.buddyConnectionId === conn.id || c.otherUser.userId === conn.buddy?.userId);
                              if (conv) {
                                navigate(`/dashboard/chat/${conv.id}`);
                              } else {
                                toast.error('Check your messages; chat could not be found right now.', { icon: '🥲' });
                                navigate('/dashboard/chat');
                              }
                            } catch (error) {
                              toast.error('Failed to load chat');
                            }
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
        isLoading={selectedBuddy ? loading.actions[selectedBuddy.userId] : false}
      />

      <InformationModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
};
