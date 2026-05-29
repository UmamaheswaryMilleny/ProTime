import { useEffect, useRef } from 'react';
import { socketService } from '../../../shared/services/socketService';
import { useAppDispatch } from '../../../store/hooks';
import { addIncomingMessage, fetchRoomById, leaveRoom } from '../store/studyRoomSlice';
import type { RoomMessageDTO } from '../api/studyRoomApi';
import { useAppSelector } from '../../../store/hooks';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants/constants.routes';
import toast from 'react-hot-toast';

export const useStudyRoomSocket = (roomId: string | null) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(s => s.auth);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!roomId) return;

    // Join the socket room
    if (!joinedRef.current) {
      socketService.emit('join:room', roomId);
      joinedRef.current = true;
    }

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

    socketService.on('room:new-message', handleNewMessage);
    socketService.on('room:user-kicked', handleUserKicked);
    socketService.on('room:user-joined', handleUserJoined);
    socketService.on('room:started', handleRoomStarted);

    return () => {
      socketService.off('room:new-message', handleNewMessage);
      socketService.off('room:user-kicked', handleUserKicked);
      socketService.off('room:user-joined', handleUserJoined);
      socketService.off('room:started', handleRoomStarted);
      socketService.emit('leave:room', roomId);
      joinedRef.current = false;
    };
  }, [roomId, dispatch]);
};
