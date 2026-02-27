import { Link } from 'react-router-dom';
import { Loader, CheckCircle } from 'lucide-react';
import { useForgotPassword } from '../hooks/useForgotpassword';
import { ROUTES } from '../../../config/env';

export const ForgotPasswordForm = () => {
  const { form, onSubmit, isLoading, isEmailSent } = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = form;

  // Success state — email sent
  if (isEmailSent) {
    return (
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-500" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
        <p className="text-zinc-400 text-sm mb-6">
          If an account with that email exists, we've sent a password reset link.
        </p>
        <Link
          to={ROUTES.LOGIN}
          className="text-[blueviolet] hover:underline text-sm"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[blueviolet]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[blueviolet]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
        <p className="text-zinc-400 text-sm">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Email Address</label>
          <input
            {...register('email')}
            type="email"
            className={`w-full bg-transparent border ${
              errors.email ? 'border-red-500' : 'border-zinc-700 focus:border-[blueviolet]'
            } rounded-lg p-3 text-white outline-none transition-colors`}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[blueviolet] hover:bg-[#5b2091] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 shadow-[0_0_15px_rgba(138,43,226,0.3)]"
        >
          {isLoading ? <Loader className="animate-spin" size={20} /> : 'Send Reset Link'}
        </button>

        {/* Back to login */}
        <div className="text-center">
          <Link
            to={ROUTES.LOGIN}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};