import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { useSignin } from '../hooks/useSignin';
import { GoogleButton } from './GoogleButton';
import { ROUTES } from '../../../config/env';

export const SigninForm = () => {
  const { form, onSubmit, isLoading } = useSignin();
  const { register, handleSubmit, formState: { errors } } = form;

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full h-full flex flex-col justify-center px-8 py-10 lg:px-12 bg-black text-white">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Sign In</h2>
        <p className="text-zinc-400">Welcome back to ProTime</p>
      </div>

      {/* Google Button */}
      <div className="mb-6">
        <GoogleButton label="signin_with" />
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="border-t border-zinc-800 w-full" />
        <span className="absolute bg-black px-3 text-sm text-zinc-500">or</span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">Email</label>
          <input
            {...register('email')}
            type="email"
            className={`w-full bg-transparent border ${
              errors.email ? 'border-red-500' : 'border-white/20 focus:border-[blueviolet]'
            } rounded-lg p-3 text-white outline-none transition-colors`}
            placeholder="john@example.com" autoComplete="current-password"
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

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
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-sm text-zinc-400 hover:text-white hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[blueviolet] hover:bg-[#5b2091] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(138,43,226,0.3)]"
        >
          {isLoading ? <Loader className="animate-spin" size={20} /> : 'Sign In'}
        </button>

        {/* Register Link */}
        <p className="text-center text-zinc-400 text-sm">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="text-[blueviolet] hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};