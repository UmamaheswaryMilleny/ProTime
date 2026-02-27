import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/auth-types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

/* ---------------- Helper: Sanitize User ---------------- */
// Ensures password or unsafe fields are NEVER stored
const sanitizeUserData = (user: unknown): User | null => {
  if (!user || typeof user !== "object") {
    return null;
  }

  const userObj = user as Record<string, unknown>;

  const sanitized: User = {
    id: String(userObj.id || ""),
    firstName: String(userObj.firstName || ""),
    lastName: String(userObj.lastName || ""),
    email: String(userObj.email || ""),
    role: userObj.role as User["role"],
  };

  // Add profileImage only if valid
  if (userObj.profileImage && typeof userObj.profileImage === "string") {
    sanitized.profileImage = userObj.profileImage;
  }

  return sanitized;
};

/* ---------------- Load Initial User ---------------- */
const getInitialUser = (): User | null => {
  try {
    const stored = localStorage.getItem("authSession");
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return sanitizeUserData(parsed);
  } catch {
    localStorage.removeItem("authSession");
    return null;
  }
};

const initialState: AuthState = {
  user: getInitialUser(),
  isAuthenticated: !!localStorage.getItem("authSession"),
};

/* ---------------- Slice ---------------- */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /* -------- Login -------- */
    loginUser: (state, action: PayloadAction<User>) => {
      const sanitized = sanitizeUserData(action.payload);

      if (sanitized) {
        state.user = sanitized;
        state.isAuthenticated = true;
        localStorage.setItem("authSession", JSON.stringify(sanitized));
      }
    },

    /* -------- Update User (FIX) -------- */
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (!state.user) return;

      state.user = {
        ...state.user,
        ...action.payload,
      };

      localStorage.setItem("authSession", JSON.stringify(state.user));
    },

    /* -------- Logout -------- */
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("authSession");
      localStorage.removeItem("accessToken");
    },
  },
});

/* ---------------- Exports ---------------- */
export const { loginUser, logoutUser, updateUser } = authSlice.actions;
export default authSlice.reducer;
