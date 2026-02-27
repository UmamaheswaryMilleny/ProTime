import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { useSignup } from '../hooks/useSignup';
import { GoogleButton } from './GoogleButton';
import { ROUTES } from '../../../config/env';

export const SignupForm = () => {
  const { form, onSubmit, isLoading } = useSignup();
  const { register, handleSubmit, formState: { errors } } = form;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 py-10 lg:px-12 bg-black text-white">

      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Sign Up</h2>
        <p className="text-zinc-400">Welcome to ProTime</p>
      </div>

      {/* Google Button */}
      <div className="mb-6">
        <GoogleButton label="signup_with" />
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="border-t border-zinc-800 w-full" />
        <span className="absolute bg-black px-3 text-sm text-zinc-500">or</span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Full Name + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Full Name</label>
            <input
              {...register('fullName')}
              className={`w-full bg-transparent border ${
                errors.fullName ? 'border-red-500' : 'border-white/20 focus:border-[blueviolet]'
              } rounded-lg p-3 text-white outline-none transition-colors`}
              placeholder="John Smith"
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Email</label>
            <input
              {...register('email')}
              className={`w-full bg-transparent border ${
                errors.email ? 'border-red-500' : 'border-white/20 focus:border-[blueviolet]'
              } rounded-lg p-3 text-white outline-none transition-colors`}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Password + Confirm Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`w-full bg-transparent border ${
                  errors.password ? 'border-red-500' : 'border-white/20 focus:border-[blueviolet]'
                } rounded-lg p-3 text-white outline-none transition-colors pr-10`}
                placeholder="••••••••"   autoComplete="new-password" 
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
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className={`w-full bg-transparent border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-white/20 focus:border-[blueviolet]'
                } rounded-lg p-3 text-white outline-none transition-colors pr-10`}
                placeholder="••••••••"
                  autoComplete="new-password" 
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
              <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[blueviolet] hover:bg-[#5b2091] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center mt-4 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(138,43,226,0.3)]"
        >
          {isLoading ? <Loader className="animate-spin" size={20} /> : 'Create Account'}
        </button>

        {/* Login Link */}
        <p className="text-center text-zinc-400 text-sm">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-[blueviolet] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};