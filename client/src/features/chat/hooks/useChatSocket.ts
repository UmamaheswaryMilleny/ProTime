import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { socketService } from '../../../shared/services/socketService';
import { updateConversationPreview, setUserOnlineStatus, setIncomingCall, setActiveCall } from '../store/chatSlice';
import { setBuddyPomodoro } from '../../todo/store/pomodoroSlice';
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
        lastMessageContent: message.content,
        lastMessageAt: message.createdAt,
        incrementUnread: !isViewingThisChat
      }));

      // Toast is now handled by the notification:new listener in socketService.ts
      // or we could keep it here if we want specialized behavior.
      // However, the task asked to avoid notifications if in-chat.
    };

    const handleUserOnline = ({ userId }: { userId: string }) => {
      dispatch(setUserOnlineStatus({ userId, isOnline: true }));
    };

    const handleUserOffline = ({ userId }: { userId: string }) => {
      dispatch(setUserOnlineStatus({ userId, isOnline: false }));
    };


    const handleWebRTCOffer = (data: { conversationId: string; offer: RTCSessionDescriptionInit; callerName?: string }) => {
      dispatch(setIncomingCall({ 
        conversationId: data.conversationId, 
        offer: data.offer, 
        callerName: data.callerName || 'Buddy' 
      }));
    };

    const handleWebRTCCallEnded = () => {
      dispatch(setIncomingCall(null));
      dispatch(setActiveCall(null));
    };

    const handlePomodoroStart = (data: any) => {
      // Automatically join the buddy's Pomodoro without a toast
      dispatch(setBuddyPomodoro({ ...data, type: 'START' }));
    };

    const handlePomodoroPause = (data: any) => {
      dispatch(setBuddyPomodoro({ ...data, type: 'PAUSE' }));
    };

    const handlePomodoroResume = (data: any) => {
      dispatch(setBuddyPomodoro({ ...data, type: 'RESUME' }));
    };

    const handlePomodoroStop = (data: any) => {
      dispatch(setBuddyPomodoro({ ...data, type: 'STOP' }));
      toast('Buddy stopped Pomodoro', { icon: '⏹️' });
    };

    const handlePomodoroSync = (data: any) => {
        dispatch(setBuddyPomodoro(data));
    };

    socketService.on('chat:message', handleNewMessage);
    socketService.on('user:online', handleUserOnline);
    socketService.on('user:offline', handleUserOffline);
    socketService.on('webrtc:offer', handleWebRTCOffer);
    socketService.on('webrtc:call-ended', handleWebRTCCallEnded);
    socketService.on('pomodoro:start', handlePomodoroStart);
    socketService.on('pomodoro:pause', handlePomodoroPause);
    socketService.on('pomodoro:resume', handlePomodoroResume);
    socketService.on('pomodoro:stop', handlePomodoroStop);
    socketService.on('pomodoro:sync', handlePomodoroSync);

    return () => {
      socketService.off('chat:message', handleNewMessage);
      socketService.off('user:online', handleUserOnline);
      socketService.off('user:offline', handleUserOffline);
      socketService.off('webrtc:offer', handleWebRTCOffer);
      socketService.off('webrtc:call-ended', handleWebRTCCallEnded);
      socketService.off('pomodoro:start', handlePomodoroStart);
      socketService.off('pomodoro:pause', handlePomodoroPause);
      socketService.off('pomodoro:resume', handlePomodoroResume);
      socketService.off('pomodoro:stop', handlePomodoroStop);
      socketService.off('pomodoro:sync', handlePomodoroSync);
    };
  }, [dispatch]);
};
