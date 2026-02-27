import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  fullName: string;         // ← capital N — matches DashboardHeader + backend DTO
  email: string;
  role: "ADMIN" | "CLIENT";
  accessToken: string;
  profileImage?: string;    // ← optional, set after profile fetch
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  // Stores email temporarily between register → verify-otp steps
  pendingEmail: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sanitizes user data before storing in Redux + localStorage
 * Ensures only safe fields are stored — never passwords or sensitive data
 */
const sanitizeUser = (data: unknown): AuthUser | null => {
  if (!data || typeof data !== "object") return null;

  const obj = data as Record<string, unknown>;

  if (!obj.id || !obj.email || !obj.role) return null;

  return {
    id: String(obj.id),
    fullName: String(obj.fullName || obj.fullname || ""),  // handle both cases
    email: String(obj.email),
    role: obj.role as AuthUser["role"],
    accessToken: String(obj.accessToken || ""),
    profileImage: obj.profileImage ? String(obj.profileImage) : undefined,
  };
};

/**
 * Loads persisted user from localStorage on app start
 * If data is corrupted, clears it and returns null
 */
const getInitialUser = (): AuthUser | null => {
  try {
    const stored = localStorage.getItem("authSession");
    if (!stored) return null;
    return sanitizeUser(JSON.parse(stored));
  } catch {
    localStorage.removeItem("authSession");
    return null;
  }
};

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: getInitialUser(),
  isAuthenticated: !!localStorage.getItem("authSession"),
  pendingEmail: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * loginUser — called after successful login or google auth
     * Stores user in Redux state + localStorage + accessToken in localStorage
     *
     * Payload shape matches backend login response:
     * { accessToken } from response.data.data
     * + user info fetched separately or decoded
     */
    loginUser: (state, action: PayloadAction<AuthUser>) => {
      const sanitized = sanitizeUser(action.payload);
      if (!sanitized) return;

      state.user = sanitized;
      state.isAuthenticated = true;

      // Persist user session across page refreshes
      localStorage.setItem("authSession", JSON.stringify(sanitized));
      // Store accessToken separately for axios interceptor
      localStorage.setItem("accessToken", sanitized.accessToken);
    },

    /**
     * updateUser — called after profile update
     * Merges partial user data into existing state
     */
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (!state.user) return;

      state.user = {
        ...state.user,
        ...action.payload,
      };

      localStorage.setItem("authSession", JSON.stringify(state.user));
    },

    /**
     * updateAccessToken — called after token refresh
     * Only updates the accessToken, keeps rest of user data
     */
    updateAccessToken: (state, action: PayloadAction<string>) => {
      if (!state.user) return;

      state.user.accessToken = action.payload;
      localStorage.setItem("accessToken", action.payload);
      localStorage.setItem("authSession", JSON.stringify(state.user));
    },

    /**
     * logoutUser — clears all auth state and localStorage
     */
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.pendingEmail = null;

      localStorage.removeItem("authSession");
      localStorage.removeItem("accessToken");
    },

    /**
     * setPendingEmail — stores email during register → verify-otp flow
     * Frontend needs to remember which email to verify after registration
     */
    setPendingEmail: (state, action: PayloadAction<string>) => {
      state.pendingEmail = action.payload;
    },

    /**
     * clearPendingEmail — clears pending email after OTP verified
     */
    clearPendingEmail: (state) => {
      state.pendingEmail = null;
    },
  },
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const {
  loginUser,
  logoutUser,
  updateUser,
  updateAccessToken,
  setPendingEmail,
  clearPendingEmail,
} = authSlice.actions;

export default authSlice.reducer;