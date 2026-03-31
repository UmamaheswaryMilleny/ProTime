import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchRoomById, fetchRoomMessages } from '../store/studyRoomSlice';
import { useStudyRoomSocket } from '../hooks/useStudyRoomSocket';
import { RoomChatWindow } from '../components/RoomChatWindow';
import { RoomSidebar } from '../components/RoomSidebar';
import { GroupVideoCall } from '../components/GroupVideoCall';
import { ROUTES } from '../../../shared/constants/constants.routes';
import { Loader2 } from 'lucide-react';

export const StudyRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { activeRoom, isLoading, isInGroupCall, error } = useAppSelector(s => s.studyRoom);
  const { user } = useAppSelector(s => s.auth);
  const [isAiMode, setIsAiMode] = React.useState(false);

  // Connect to socket room
  useStudyRoomSocket(roomId || null);

  // Fetch room details and messages
  useEffect(() => {
    if (!roomId) return;
    dispatch(fetchRoomById(roomId));
    dispatch(fetchRoomMessages({ roomId }));
  }, [dispatch, roomId]);

  // Redirect if error or not a member
  useEffect(() => {
    if (error === 'Room not found') {
      navigate(ROUTES.DASHBOARD_STUDY_ROOMS, { replace: true });
    }
  }, [error, navigate]);

  const isHost = activeRoom?.hostId === user?.id;

  if (isLoading || !activeRoom) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 size={32} className="animate-spin text-[blueviolet]" />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100vh-32px)] sm:h-[calc(100vh-48px)] lg:h-[calc(100vh-64px)] w-full gap-4">
        {/* Chat area — 2/3 */}
        <div className="flex-1 min-w-0">
          <RoomChatWindow roomId={activeRoom.id} isAiMode={isAiMode} setIsAiMode={setIsAiMode} />
        </div>

        {/* Sidebar — 1/3 (hidden on mobile) */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <RoomSidebar isHost={isHost} isAiMode={isAiMode} />
        </div>
      </div>

      {/* Group Video Call Overlay */}
      {isInGroupCall && <GroupVideoCall />}
    </>
  );
};
