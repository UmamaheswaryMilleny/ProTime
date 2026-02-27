import React from 'react';
import { Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-black py-12 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="text-2xl font-bold flex items-center gap-1">
                            <span className="text-[blueviolet]">Pro</span>
                            <span className="text-white">Time</span>
                        </Link>
                        <p className="text-zinc-500 text-sm">
                            © 2025 ProTime. All rights reserved.
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">About</a></li>
                            <li><a href="#features" className="text-zinc-400 hover:text-white transition-colors text-sm">Features</a></li>
                            <li><a href="#pricing" className="text-zinc-400 hover:text-white transition-colors text-sm">Pricing</a></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">News</a></li>
                            <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">Help</a></li>
                            <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">Contact</a></li>
                        </ul>
                    </div>

                    {/* Socials */}
                    <div className="flex gap-4">
                        <a href="#" className="text-zinc-400 hover:text-[blueviolet] transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="text-zinc-400 hover:text-[blueviolet] transition-colors"><Instagram size={20} /></a>
                        <a href="#" className="text-zinc-400 hover:text-[blueviolet] transition-colors"><Linkedin size={20} /></a>
                        <a href="#" className="text-zinc-400 hover:text-[blueviolet] transition-colors"><Facebook size={20} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
