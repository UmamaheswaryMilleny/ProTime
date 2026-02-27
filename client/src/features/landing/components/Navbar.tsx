import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ROUTES } from '../../../config/env';
export const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '#' },
        { name: 'Features', href: '#features' },
        { name: 'How it Works', href: '#how-it-works' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Testimonials', href: '#testimonials' },
        { name: 'Blog', href: '#blog' },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold flex items-center gap-1">
                        <span className="text-[blueviolet]">Pro</span>
                        <span className="text-white">Time</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            to={ROUTES.LOGIN}
                            className="text-sm font-medium text-white hover:text-[blueviolet] transition-colors"
                        >
                            Log in
                        </Link>
                        <Link
                            to={ROUTES.REGISTER}
                            className="bg-[blueviolet] hover:bg-[#5b2091] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all shadow-[0_0_15px_rgba(138,43,226,0.3)] hover:shadow-[0_0_20px_rgba(138,43,226,0.5)]"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-black border-t border-white/10 p-4 flex flex-col gap-4 shadow-xl">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-white font-medium py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10">
                        <Link
                            to={ROUTES.LOGIN}
                            className="text-center font-medium text-white hover:text-[blueviolet] transition-colors py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Log in
                        </Link>
                        <Link
                            to={ROUTES.REGISTER}
                            className="bg-[blueviolet] hover:bg-[#5b2091] text-white font-medium px-5 py-3 rounded-full text-center transition-all"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};
