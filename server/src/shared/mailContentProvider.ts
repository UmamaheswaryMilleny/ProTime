import { config } from "./config.js";
import { MAIL_CONTENT_PURPOSE } from "./constants/constants.js";

export function mailContentProvider(purpose: string, data?: any): string {
  const {
    LOGIN,
    OTP,
  } = MAIL_CONTENT_PURPOSE;

  switch (purpose) {
    case LOGIN:
      return `
      <div style="max-width: 550px; margin: auto; font-family: 'Segoe UI', Tahoma, sans-serif; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);">
        <div style="background: linear-gradient(to right, #4f46e5, #06b6d4); padding: 24px; color: white; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">🔐 OTP Verification</h2>
          <p style="margin: 8px 0 0; font-size: 14px;">Verify your email to activate your account</p>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333;">Hi there 👋,</p>
          <p style="font-size: 15px; color: #555;">Thank you for signing up with <strong>ProTime</strong>!</p>
          <p style="font-size: 15px; color: #555;">Your one-time password (OTP) is:</p>
          
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 28px; background-color: #4f46e5; color: #fff; padding: 14px 30px; border-radius: 10px; font-weight: bold; letter-spacing: 4px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);">
              ${data}
            </span>
          </div>

          <p style="font-size: 14px; color: #888;">⏰ This OTP is valid for <strong>1 minute</strong>. Do not share it with anyone.</p>
          <p style="font-size: 13px; color: #aaa; margin-top: 40px; text-align: center;">
            Cheers,<br/>The ProTime  Team 🌍
          </p>
        </div>
      </div>
      `;
    case OTP:
      return `
  <div style="
    max-width: 560px;
    margin: 40px auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    overflow: hidden;
  ">
    
    <!-- Header -->
    <div style="
      background: linear-gradient(135deg, #6366f1, #22d3ee);
      padding: 24px;
      text-align: center;
      color: #ffffff;
    ">
      <h2 style="margin: 0; font-size: 24px;">
        Email Verification
      </h2>
      <p style="margin-top: 8px; font-size: 14px;">
        Complete your signup using the OTP below
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #111827;">
        Hi 👋,
      </p>

      <p style="font-size: 15px; color: #374151; line-height: 1.6;">
        Thank you for registering with <strong>ProTime </strong>.
        To verify your email address and complete your signup, please use the
        One-Time Password (OTP) below:
      </p>

      <!-- OTP Box -->
      <div style="text-align: center; margin: 32px 0;">
        <span style="
          display: inline-block;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: 6px;
          color: #ffffff;
          background-color: #4f46e5;
          padding: 16px 36px;
          border-radius: 10px;
        ">
          ${data}
        </span>
      </div>

      <p style="font-size: 14px; color: #6b7280;">
        ⏱️ This OTP is valid for <strong>1 minute</strong>.
        Please do not share this code with anyone.
      </p>

      <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
        If you didn’t create an account, you can safely ignore this email.
      </p>

      <!-- Footer -->
      <div style="margin-top: 40px; text-align: center; font-size: 13px; color: #9ca3af;">
        <p style="margin: 0;">
          Regards,<br />
          <strong>ProTime Team</strong> 
        </p>
      </div>
    </div>
  </div>
  `;

    default:
      return "";
  }
}