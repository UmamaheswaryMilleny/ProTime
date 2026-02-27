// src/shared/mail-content-provider.ts
import { MAIL_CONTENT_PURPOSE } from './constants/constants.js';

export function mailContentProvider(purpose: string, data?: string): string {
  switch (purpose) {

    case MAIL_CONTENT_PURPOSE.OTP:
      return `
        <div style="max-width:560px;margin:40px auto;font-family:'Segoe UI',sans-serif;
          background:#fff;border-radius:12px;border:1px solid #e5e7eb;
          box-shadow:0 10px 25px rgba(0,0,0,0.05);overflow:hidden;">
          <div style="background:linear-gradient(135deg,#6366f1,#22d3ee);
            padding:24px;text-align:center;color:#fff;">
            <h2 style="margin:0;font-size:24px;">Email Verification</h2>
            <p style="margin-top:8px;font-size:14px;">
              Complete your signup using the OTP below
            </p>
          </div>
          <div style="padding:32px;">
            <p style="font-size:16px;color:#111827;">Hi 👋,</p>
            <p style="font-size:15px;color:#374151;line-height:1.6;">
              Thank you for registering with <strong>ProTime</strong>.
              Use the OTP below to verify your email:
            </p>
            <div style="text-align:center;margin:32px 0;">
              <span style="display:inline-block;font-size:30px;font-weight:700;
                letter-spacing:6px;color:#fff;background-color:#4f46e5;
                padding:16px 36px;border-radius:10px;">
                ${data}
              </span>
            </div>
            <p style="font-size:14px;color:#6b7280;">
              ⏱️ This OTP is valid for <strong>5 minutes</strong>.
              Do not share this code with anyone.
            </p>
            <div style="margin-top:40px;text-align:center;font-size:13px;color:#9ca3af;">
              <p style="margin:0;">Regards,<br/><strong>ProTime Team</strong></p>
            </div>
          </div>
        </div>`;

    case MAIL_CONTENT_PURPOSE.RESET:
      return `
        <div style="max-width:560px;margin:40px auto;font-family:'Segoe UI',sans-serif;
          background:#fff;border-radius:12px;border:1px solid #e5e7eb;
          box-shadow:0 10px 25px rgba(0,0,0,0.05);overflow:hidden;">
          <div style="background:linear-gradient(135deg,#ef4444,#f97316);
            padding:24px;text-align:center;color:#fff;">
            <h2 style="margin:0;font-size:24px;">🔐 Reset Your Password</h2>
            <p style="margin-top:8px;font-size:14px;">
              You requested a password reset
            </p>
          </div>
          <div style="padding:32px;">
            <p style="font-size:16px;color:#111827;">Hi 👋,</p>
            <p style="font-size:15px;color:#374151;line-height:1.6;">
              We received a request to reset your <strong>ProTime</strong> password.
              Click the button below to reset it:
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${data}" style="display:inline-block;background-color:#ef4444;
                color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;
                font-size:16px;font-weight:600;">
                Reset Password
              </a>
            </div>
            <p style="font-size:14px;color:#6b7280;">
              ⏱️ This link is valid for <strong>5 minutes</strong>.
              If you did not request this, ignore this email.
            </p>
            <div style="margin-top:40px;text-align:center;font-size:13px;color:#9ca3af;">
              <p style="margin:0;">Regards,<br/><strong>ProTime Team</strong></p>
            </div>
          </div>
        </div>`;

    default:
      return '';
  }
}