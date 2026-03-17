import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/store/authSlice";
import buddyReducer from "../features/buddy-match/store/buddySlice";
import communityReducer from "../features/community-chat/store/communitySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    buddy: buddyReducer,
    community: communityReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;