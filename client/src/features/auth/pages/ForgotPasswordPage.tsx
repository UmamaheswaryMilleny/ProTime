import React from 'react';

import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

export const ForgotPasswordPage: React.FC = () => {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#000000]">
            <ForgotPasswordForm />
        </div>
    );
};
