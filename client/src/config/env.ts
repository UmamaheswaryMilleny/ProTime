export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID as string, // ← added
};

export const ROLES = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
} as const;