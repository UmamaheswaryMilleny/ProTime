import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { socketService } from '../../../shared/services/socketService';
import { updateConversationPreview, setUserOnlineStatus, setActiveSession, removeActiveSession, setIncomingCall, setActiveCall } from '../store/chatSlice';
import type { ChatSessionResponseDTO } from '../api/chatApi';
import toast from 'react-hot-toast';

export const useChatSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleNewMessage = (message: any) => {
      // Find if we are currently looking at this conversation
      const currentUrl = window.location.pathname;
      const isViewingThisChat = currentUrl.includes(`/chat/${message.conversationId}`);

      dispatch(updateConversationPreview({
        conversationId: message.conversationId,
        lastMessageBy: message.senderId,
        lastMessageByName: message.fullName,
        lastMessageAt: message.createdAt,
        incrementUnread: !isViewingThisChat
      }));

      if (!isViewingThisChat && message.messageType !== 'SYSTEM') {
        toast.success(`New message from ${message.fullName}`);
      }
    };

    const handleUserOnline = ({ userId }: { userId: string }) => {
      dispatch(setUserOnlineStatus({ userId, isOnline: true }));
    };

    const handleUserOffline = ({ userId }: { userId: string }) => {
      dispatch(setUserOnlineStatus({ userId, isOnline: false }));
    };

    const handleSessionStarted = (session: ChatSessionResponseDTO) => {
      dispatch(setActiveSession(session));
      toast.success(`Pomodoro started by ${session.startedByName}`);
    };

    const handleSessionEnded = (session: ChatSessionResponseDTO) => {
      dispatch(removeActiveSession(session.conversationId));
      toast('Pomodoro session ended', { icon: '⏰' });
    };

    const handleWebRTCOffer = (data: { conversationId: string; offer: RTCSessionDescriptionInit }) => {
      // Find the caller's name using conversations in state
      // We will let the Notification UI handle it, so we just dispatch
      dispatch(setIncomingCall({ 
        conversationId: data.conversationId, 
        offer: data.offer, 
        callerName: 'Buddy' 
      }));
    };

    const handleWebRTCCallEnded = () => {
      dispatch(setIncomingCall(null));
      dispatch(setActiveCall(null));
    };

    socketService.on('chat:message', handleNewMessage);
    socketService.on('user:online', handleUserOnline);
    socketService.on('user:offline', handleUserOffline);
    socketService.on('chat:session-started', handleSessionStarted);
    socketService.on('chat:session-ended', handleSessionEnded);
    socketService.on('webrtc:offer', handleWebRTCOffer);
    socketService.on('webrtc:call-ended', handleWebRTCCallEnded);

    return () => {
      socketService.off('chat:message', handleNewMessage);
      socketService.off('user:online', handleUserOnline);
      socketService.off('user:offline', handleUserOffline);
      socketService.off('chat:session-started', handleSessionStarted);
      socketService.off('chat:session-ended', handleSessionEnded);
      socketService.off('webrtc:offer', handleWebRTCOffer);
      socketService.off('webrtc:call-ended', handleWebRTCCallEnded);
    };
  }, [dispatch]);
};
