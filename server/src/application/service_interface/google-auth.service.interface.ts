export interface SocialUserInfo  {
  email: string;
  name: string;
  picture?: string;
  googleId: string; 
}

export interface IgoogleAuth {
  verifyToken(idToken: string): Promise<SocialUserInfo>;
}


