import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Users, MessageCircle, Calendar } from 'lucide-react';
import { ROUTES } from '../../../config/env';
export const HeroSection: React.FC = () => {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-[blueviolet]/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

                {/* Floating Avatars (Decorative) - Left Side */}
                <div className="hidden lg:block absolute top-40 left-10 xl:left-20 animate-float-slow">
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces"
                            alt="User"
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 shadow-lg"
                        />
                        <div className="absolute -bottom-3 -right-3 bg-zinc-800 p-1.5 rounded-lg border border-white/10">
                            <MessageCircle size={14} className="text-[blueviolet]" />
                        </div>
                    </div>
                </div>
                <div className="hidden lg:block absolute top-80 left-20 xl:left-40 animate-float-slower">
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces"
                            alt="User"
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-white/10 shadow-lg"
                        />
                        <div className="absolute -top-2 -right-2 bg-zinc-800 p-1.5 rounded-lg border border-white/10">
                            <Calendar size={12} className="text-green-500" />
                        </div>
                    </div>
                </div>

                {/* Floating Avatars (Decorative) - Right Side */}
                <div className="hidden lg:block absolute top-40 right-10 xl:right-20 animate-float-slow">
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces"
                            alt="User"
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 shadow-lg"
                        />
                        <div className="absolute -bottom-3 -left-3 bg-zinc-800 p-1.5 rounded-lg border border-white/10">
                            <Users size={14} className="text-blue-500" />
                        </div>
                    </div>
                </div>
                <div className="hidden lg:block absolute top-80 right-20 xl:right-40 animate-float-slower">
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces"
                            alt="User"
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 shadow-lg"
                        />
                        <div className="absolute -top-2 -left-2 bg-zinc-800 p-1.5 rounded-lg border border-white/10">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>


                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
                    Learn together, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[blueviolet] to-blue-500">
                        Grow together
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Find Your Perfect Study Partner Or Group, Stay Focused, Track Accountability, And Learn More Efficiently.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to={ROUTES.REGISTER}
                        className="w-full sm:w-auto bg-[blueviolet] hover:bg-[#5b2091] text-white font-semibold px-8 py-4 rounded-full transition-all shadow-[0_0_20px_rgba(138,43,226,0.3)] hover:shadow-[0_0_30px_rgba(138,43,226,0.5)] flex items-center justify-center gap-2"
                    >
                        Get Started
                        <ArrowRight size={20} />
                    </Link>

                    <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                        <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center">
                            <Play size={10} fill="currentColor" />
                        </div>
                        Watch Demo
                    </button>
                </div>

                {/* Hero Image / Dashboard Preview */}
                <div className="mt-20 relative mx-auto max-w-5xl">
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-[blueviolet]/10">
                        <img
                            src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=2670&auto=format&fit=crop"
                            alt="Online meeting"
                            className="w-full h-[300px] md:h-[500px] object-cover object-top opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                        {/* Floating UI Elements on top of image */}
                        <div className="absolute bottom-10 left-10 right-10 flex justify-center">
                            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-6 max-w-md">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-xs font-bold">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-full h-full rounded-full" alt="User" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-black bg-[blueviolet] flex items-center justify-center text-xs font-bold">
                                        +5
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-bold text-sm">1k+ Study Groups</p>
                                    <p className="text-zinc-400 text-xs text-[blueviolet]">Join feature active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
