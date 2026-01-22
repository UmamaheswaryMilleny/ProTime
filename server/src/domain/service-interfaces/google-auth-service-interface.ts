export interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  // Google user ID
  sub: string; 
}

export interface IGoogleAuthService {
  verifyToken(idToken: string): Promise<GoogleUserInfo>;
}
