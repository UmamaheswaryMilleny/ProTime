import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { respondToJoinRequest, joinRoom, fetchAllRequests } from '../store/studyRoomSlice';
import { JoinRequestItem } from './JoinRequestItem';
import { Inbox, UserPlus, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export const RequestsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { invitations, allRequests, isLoading } = useAppSelector(s => s.studyRoom);

  const handleAcceptInvite = async (roomId: string) => {
    try {
      await dispatch(joinRoom(roomId)).unwrap();
      toast.success('Joined room!');
      dispatch(fetchAllRequests());
    } catch (e: any) {
      toast.error(e || 'Failed to join');
    }
  };

  const handleDeclineInvite = async (requestId: string) => {
    try {
      await dispatch(respondToJoinRequest({ requestId, action: 'REJECTED' })).unwrap();
      toast.success('Invitation declined');
      dispatch(fetchAllRequests());
    } catch (e: any) {
      toast.error(e || 'Failed to decline');
    }
  };

  const handleRespondJoin = async (requestId: string, action: 'ACCEPTED' | 'REJECTED') => {
    try {
      await dispatch(respondToJoinRequest({ requestId, action })).unwrap();
      toast.success(`Request ${action.toLowerCase()}ed`);
      dispatch(fetchAllRequests());
    } catch (e: any) {
      toast.error(e || 'Failed to respond');
    }
  };

  if (isLoading && invitations.length === 0 && allRequests.length === 0) {
    return null; // Parent shows loader
  }

  if (invitations.length === 0 && allRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-500 gap-3">
        <Inbox size={48} className="opacity-20" />
        <p className="text-sm">No pending requests or invitations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Invitations Section */}
      {invitations.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Send size={18} className="text-[blueviolet]" />
            <h2 className="text-lg font-bold text-white">Invitations Received</h2>
            <span className="px-2 py-0.5 rounded-full bg-[blueviolet]/10 text-[blueviolet] text-xs font-bold">
              {invitations.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invitations.map(req => (
              <JoinRequestItem
                key={req.id}
                request={req}
                type="INVITATION"
                onAccept={() => handleAcceptInvite(req.roomId)}
                onDecline={() => handleDeclineInvite(req.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Join Requests Section */}
      {allRequests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <UserPlus size={18} className="text-amber-500" />
            <h2 className="text-lg font-bold text-white">Join Requests for your Rooms</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold">
              {allRequests.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allRequests.map(req => (
              <JoinRequestItem
                key={req.id}
                request={req}
                type="JOIN_REQUEST"
                onAccept={() => handleRespondJoin(req.id, 'ACCEPTED')}
                onDecline={() => handleRespondJoin(req.id, 'REJECTED')}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
