import React, { useEffect, useState } from 'react';
import { HelpCircle, User, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
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
import { ROUTES } from '../../../config/env';
import type { BuddyProfile } from '../types/buddy.types';
import { toast } from 'react-hot-toast';

export const FindBuddyPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
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

  const [activeTab, setActiveTab] = useState<'find' | 'requests' | 'mybuddy'>(getTabFromPath(location.pathname));
  const [searchQuery, setSearchQuery] = useState('');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<BuddyProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isGlobal, setIsGlobal] = useState(false);
  const itemsPerPage = 10;

  // For editing preferences in sidebar locally before applying
  const [editPrefs, setEditPrefs] = useState<any>(null);
  const [preferencesReady, setPreferencesReady] = useState(false);

  useEffect(() => {
    dispatch(fetchPreferences());
    dispatch(fetchBuddyList());
    dispatch(fetchPendingRequests());
    dispatch(fetchSentRequests());

    // Sync isPremium in case the JWT is stale after a recent payment
    subscriptionService.getSubscription()
      .then(sub => {
        if (sub?.isPremium && !isPremium) {
          dispatch(updateUser({ isPremium: true }));
        }
      })
      .catch(() => {}); // silently ignore if not authenticated yet
  }, [dispatch]);

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
    } catch (err) {}
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
          <div className="relative flex-1">
            <BuddySearch value={searchQuery} onChange={setSearchQuery} />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-[#18181B] rounded-full p-1 border border-white/5 flex items-center">
              <BuddyNavbar 
                activeTab={activeTab} 
                onTabChange={(tab) => setActiveTab(tab)} 
              />
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
                            if (action === 'accept' || action === 'decline') {
                              try {
                                const status = action === 'accept' ? 'CONNECTED' : 'DECLINED';
                                await dispatch(respondToBuddyRequest({ connectionId: conn.id, status })).unwrap();
                                toast.success(action === 'accept' ? 'Buddy request accepted!' : 'Request declined');
                                // Refresh lists to move the buddy to "My Buddy" tab
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
                          }}
                        />
                      ))
                    ) : (
                      <p className="text-zinc-500 col-span-full py-10 text-center">No buddies connected yet.</p>
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
