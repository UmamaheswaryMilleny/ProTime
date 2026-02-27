import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center p-4">
            {/* Glow Effect */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative w-full max-w-300 lg:h-[94vh] bg-[#000000] border border-white/10 rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_40px_rgba(0,0,0,0.6)] flex overflow-hidden z-10">
                {children}
            </div>
        </div>
    );
};
