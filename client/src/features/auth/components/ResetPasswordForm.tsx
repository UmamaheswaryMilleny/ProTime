import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { useResetPassword } from '../hooks/useResetpassword';
import { ROUTES } from '../../../config/env';

export const ResetPasswordForm = () => {
  const { form, onSubmit, isLoading, token } = useResetPassword();
  const { register, handleSubmit, formState: { errors } } = form;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // No token in URL — invalid link
  if (!token) {
    return (
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-red-500 mb-2">Invalid Reset Link</h2>
        <p className="text-zinc-400 text-sm mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link
          to={ROUTES.FORGOT_PASSWORD}
          className="text-[blueviolet] hover:underline text-sm"
        >
          Request a new reset link
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
        <p className="text-zinc-400 text-sm">Enter your new password below.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className={`w-full bg-transparent border ${
                errors.password ? 'border-red-500' : 'border-zinc-700 focus:border-[blueviolet]'
              } rounded-lg p-3 text-white outline-none transition-colors pr-10`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              className={`w-full bg-transparent border ${
                errors.confirmPassword ? 'border-red-500' : 'border-zinc-700 focus:border-[blueviolet]'
              } rounded-lg p-3 text-white outline-none transition-colors pr-10`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[blueviolet] hover:bg-[#5b2091] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 shadow-[0_0_15px_rgba(138,43,226,0.3)]"
        >
          {isLoading ? <Loader className="animate-spin" size={20} /> : 'Reset Password'}
        </button>

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