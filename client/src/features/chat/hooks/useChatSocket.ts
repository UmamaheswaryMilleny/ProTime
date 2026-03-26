import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { socketService } from '../../../shared/services/socketService';
import { updateConversationPreview, setUserOnlineStatus, setActiveSession, removeActiveSession, setIncomingCall, setActiveCall } from '../store/chatSlice';
import { setBuddyPomodoro, clearBuddyPomodoro } from '../../todo/store/pomodoroSlice';
import type { ChatSessionResponseDTO } from '../api/chatApi';
import toast from 'react-hot-toast';

export const useChatSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleNewMessage = (message: any) => {
      const currentUrl = window.location.pathname;
      const isViewingThisChat = currentUrl.includes(`/chat/${message.conversationId}`) || currentUrl.includes('/probuddy');

      dispatch(updateConversationPreview({
        conversationId: message.conversationId,
        lastMessageBy: message.senderId,
        lastMessageByName: message.fullName || (message.messageType === 'AI' ? 'ProBuddy' : 'System'),
        lastMessageAt: message.createdAt,
        incrementUnread: !isViewingThisChat
      }));

      if (!isViewingThisChat && message.messageType !== 'SYSTEM') {
        const senderName = message.fullName || (message.messageType === 'AI' ? 'ProBuddy' : 'System');
        toast.success(`New message from ${senderName}`);
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

    const handlePomodoroSync = (data: any) => {
      dispatch(setBuddyPomodoro(data));
    };

    socketService.on('chat:message', handleNewMessage);
    socketService.on('user:online', handleUserOnline);
    socketService.on('user:offline', handleUserOffline);
    socketService.on('chat:session-started', handleSessionStarted);
    socketService.on('chat:session-ended', handleSessionEnded);
    socketService.on('webrtc:offer', handleWebRTCOffer);
    socketService.on('webrtc:call-ended', handleWebRTCCallEnded);
    socketService.on('pomodoro:sync', handlePomodoroSync);

    return () => {
      socketService.off('chat:message', handleNewMessage);
      socketService.off('user:online', handleUserOnline);
      socketService.off('user:offline', handleUserOffline);
      socketService.off('chat:session-started', handleSessionStarted);
      socketService.off('chat:session-ended', handleSessionEnded);
      socketService.off('webrtc:offer', handleWebRTCOffer);
      socketService.off('webrtc:call-ended', handleWebRTCCallEnded);
      socketService.off('pomodoro:sync', handlePomodoroSync);
    };
  }, [dispatch]);
};
