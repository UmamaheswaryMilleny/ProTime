import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/store/authSlice";
import buddyReducer from "../features/buddy-match/store/buddySlice";
import communityReducer from "../features/community-chat/store/communitySlice";
import gamificationReducer from "../features/gamification/store/gamificationSlice";
import chatReducer from "../features/chat/store/chatSlice";
import calendarReducer from "../features/calendar/store/calendarSlice";
import notificationReducer from "../features/notifications/store/notificationSlice";
import pomodoroReducer from "../features/todo/store/pomodoroSlice";
import studyRoomReducer from "../features/study-rooms/store/studyRoomSlice";
import { notificationMiddleware } from "../features/notifications/store/notificationMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    buddy: buddyReducer,
    community: communityReducer,
    gamification: gamificationReducer,
    chat: chatReducer,
    calendar: calendarReducer,
    notifications: notificationReducer,
    pomodoro: pomodoroReducer,
    studyRoom: studyRoomReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(notificationMiddleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;