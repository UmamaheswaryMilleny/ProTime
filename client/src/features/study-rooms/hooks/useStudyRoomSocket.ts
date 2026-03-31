import { useEffect, useRef } from 'react';
import { socketService } from '../../../shared/services/socketService';
import { useAppDispatch } from '../../../store/hooks';
import { addIncomingMessage } from '../store/studyRoomSlice';
import type { RoomMessageDTO } from '../api/studyRoomApi';

export const useStudyRoomSocket = (roomId: string | null) => {
  const dispatch = useAppDispatch();
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

    socketService.on('room:new-message', handleNewMessage);

    return () => {
      socketService.off('room:new-message', handleNewMessage);
      socketService.emit('leave:room', roomId);
      joinedRef.current = false;
    };
  }, [roomId, dispatch]);
};
