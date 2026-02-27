export interface IOtpService {
  generateOtp(): string;
  storeOtp(email: string, otp: string, ttlSeconds: number): Promise<void>;
  verifyOtp(data: { email: string; otp: string }): Promise<boolean>;
  deleteOtp(email: string): Promise<void>;
  getOtp(email: string): Promise<string | null>;
}
