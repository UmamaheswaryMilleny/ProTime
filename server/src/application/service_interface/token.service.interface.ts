
export interface AccessTokenPayload{
  id:string;
  email:string;
  role:string;
}

export interface RefreshTokenPayload{
  id:string
}

export interface ResetTokenPayload{
  id:string,
  email:string,
  role:string
}

export interface ITokenService {
  generateAccess(payload: AccessTokenPayload): string;
  generateRefresh(payload: RefreshTokenPayload): string;
  generateReset(payload: ResetTokenPayload): string;
// If the token is invalid or expired → return null”
  verifyAccess(token: string): AccessTokenPayload | null;
  verifyRefresh(token: string): RefreshTokenPayload | null;
  verifyReset(token: string): ResetTokenPayload | null;
}
