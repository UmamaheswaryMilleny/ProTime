//refresh token should be optional right..isnewuser is for googleauth

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  isNewUser?: boolean;
}
