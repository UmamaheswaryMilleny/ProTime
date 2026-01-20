export interface IOtpService{
    generateOtp():string,
    storeOtp(email:string,otp:string):Promise<void>
    verifyOtp(data: { email: string; otp: string }): Promise<boolean>;
    deleteOtp(email: string): Promise<void>;
}