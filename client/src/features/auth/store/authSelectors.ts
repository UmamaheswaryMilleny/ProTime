import type { RootState } from "../../../store/store";

// ─── Selectors ────────────────────────────────────────────────────────────────

// Select the full auth state
export const selectAuth = (state: RootState) => state.auth;

// Select the current logged-in user
export const selectUser = (state: RootState) => state.auth.user;

// Select just the authentication status
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;

// Select the user's role
export const selectUserRole = (state: RootState) => state.auth.user?.role;

// Select access token
export const selectAccessToken = (state: RootState) =>
  state.auth.user?.accessToken;

// Select pending email (used between register → verify-otp)
export const selectPendingEmail = (state: RootState) =>
  state.auth.pendingEmail;

// Derived: is the user an admin?
export const selectIsAdmin = (state: RootState) =>
  state.auth.user?.role === "ADMIN";

// Derived: is the user a client?
export const selectIsClient = (state: RootState) =>
  state.auth.user?.role === "CLIENT";