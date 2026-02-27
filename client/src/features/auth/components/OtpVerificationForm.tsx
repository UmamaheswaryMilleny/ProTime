import { useForm } from 'react-hook-form';
import { Loader } from 'lucide-react';
import { useOtp } from '../hooks/useOtp';

interface OtpFormData {
  otp: string;
}

export const OtpVerificationForm = () => {
  const {
    email,
    isLoading,
    isResending,
    canResend,
    formattedTimer,
    handleVerifyOtp,
    handleResendOtp,
  } = useOtp();

  const { register, handleSubmit, formState: { errors } } = useForm<OtpFormData>();

  const onSubmit = (data: OtpFormData) => {
    handleVerifyOtp(data.otp);
  };

  return (
    <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[blueviolet]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[blueviolet]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
        <p className="text-zinc-400 text-sm">
          We sent a 6-digit code to{' '}
          <span className="text-white font-medium">{email}</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* OTP Input */}
        <div className="space-y-2">
          <input
            {...register('otp', {
              required: 'OTP is required',
              pattern: {
                value: /^[0-9]{6}$/,
                message: 'OTP must be exactly 6 digits',
              },
            })}
            className={`w-full bg-transparent border ${
              errors.otp ? 'border-red-500' : 'border-zinc-700 focus:border-[blueviolet]'
            } rounded-lg p-4 text-white text-center text-2xl tracking-[0.5em] outline-none transition-colors`}
            placeholder="000000"
            maxLength={6}
            inputMode="numeric"
          />
          {errors.otp && (
            <p className="text-red-500 text-sm text-center">{errors.otp.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[blueviolet] hover:bg-[#5b2091] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 shadow-[0_0_15px_rgba(138,43,226,0.3)]"
        >
          {isLoading ? <Loader className="animate-spin" size={20} /> : 'Verify & Continue'}
        </button>

        {/* Resend OTP */}
        <div className="text-center">
          <p className="text-zinc-400 text-sm mb-2">
            {canResend
              ? "Didn't receive the code?"
              : `Resend code in ${formattedTimer}`}
          </p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={!canResend || isResending}
            className={`text-sm font-medium transition-colors ${
              canResend
                ? 'text-[blueviolet] hover:underline cursor-pointer'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
          >
            {isResending ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader size={14} className="animate-spin" /> Resending...
              </span>
            ) : (
              'Resend OTP'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};