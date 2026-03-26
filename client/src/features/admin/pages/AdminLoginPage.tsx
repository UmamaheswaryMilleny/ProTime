import React, { useState } from 'react';
import { Eye, EyeOff, Loader, Shield } from 'lucide-react';
import { useAdminLogin } from '../hooks/useAdminLogin';

export const AdminLoginPage: React.FC = () => {
    const { form, onSubmit, isLoading } = useAdminLogin();
    const { register, handleSubmit, formState: { errors } } = form;
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/8 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-800/6 blur-[140px] rounded-full" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-8 shadow-xl shadow-black/40">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="p-3 rounded-2xl bg-[#2563EB]/10 border border-[#2563EB]/20 mb-4">
                            <Shield size={28} className="text-[#2563EB]" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                        <p className="text-[#A1A1AA] text-sm mt-1.5">Sign in with your admin credentials</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                autoComplete="email"
                                placeholder="admin@protime.app"
                                className={`w-full bg-[#1F1F23] border rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-zinc-600 ${errors.email
                                        ? 'border-red-500'
                                        : 'border-[#27272A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/30'
                                    }`}
                            />
                            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Password</label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={`w-full bg-[#1F1F23] border rounded-xl px-4 py-3 pr-11 text-white outline-none transition-all placeholder:text-zinc-600 ${errors.password
                                            ? 'border-red-500'
                                            : 'border-[#27272A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/30'
                                        }`} autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 bg-[#2563EB] hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.35)] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader className="animate-spin" size={18} /> : 'Sign In to Admin Panel'}
                        </button>
                    </form>

                    {/* Footer note */}
                    <p className="text-center text-xs text-zinc-600 mt-6">
                        Restricted access · ProTime Administration
                    </p>
                </div>
            </div>
        </div>
    );
};
