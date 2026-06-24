import { useEffect } from 'react';
import { socketService } from '../../../shared/services/socketService';
import { useAppDispatch } from '../../../store/hooks';
import { addIncomingMessage, fetchRoomById, leaveRoom, setActiveRoom } from '../store/studyRoomSlice';
import type { RoomMessageDTO } from '../api/studyRoomApi';
import { useAppSelector } from '../../../store/hooks';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants/constants.routes';
import toast from 'react-hot-toast';

export const useStudyRoomSocket = (roomId: string | null) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(s => s.auth);

  useEffect(() => {
    if (!roomId) return;

    const joinRoom = () => {
      socketService.emit('join:room', roomId);
    };

    joinRoom();
    socketService.on('connect', joinRoom);

    const handleNewMessage = (message: RoomMessageDTO) => {
      dispatch(addIncomingMessage(message));
    };

    const handleUserKicked = (payload: { roomId: string, userId: string }) => {
      if (payload.userId === user?.id) {
        toast.error('You have been kicked by the host.');
        dispatch(leaveRoom(payload.roomId));
        navigate(ROUTES.DASHBOARD_STUDY_ROOMS);
      } else {
        dispatch(fetchRoomById(payload.roomId));
      }
    };

    const handleUserJoined = (payload: { roomId: string, userId: string }) => {
      dispatch(fetchRoomById(payload.roomId));
    };

    const handleRoomStarted = (payload: { roomId: string, updatedAt: string }) => {
      dispatch(fetchRoomById(payload.roomId));
      toast.success('Study session has started! 🚀');
    };

    const handleRoomEnded = (payload: { roomId: string }) => {
      if (payload.roomId === roomId) {
        toast.error('The study session has expired and the room has ended.', { id: 'room-ended-toast' });
        sessionStorage.removeItem(`in_group_call_${roomId}`);
        sessionStorage.removeItem(`session_extension_${roomId}`);
        dispatch(setActiveRoom(null));
        navigate(ROUTES.DASHBOARD_STUDY_ROOMS);
      }
    };

    socketService.on('room:new-message', handleNewMessage);
    socketService.on('room:user-kicked', handleUserKicked);
    socketService.on('room:user-joined', handleUserJoined);
    socketService.on('room:started', handleRoomStarted);
    socketService.on('room:ended', handleRoomEnded);

    return () => {
      socketService.off('connect', joinRoom);
      socketService.off('room:new-message', handleNewMessage);
      socketService.off('room:user-kicked', handleUserKicked);
      socketService.off('room:user-joined', handleUserJoined);
      socketService.off('room:started', handleRoomStarted);
      socketService.off('room:ended', handleRoomEnded);
      socketService.emit('leave:room', roomId);
    };
  }, [roomId, dispatch, user?.id]);
};
