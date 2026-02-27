import React from 'react';

import { ResetPasswordForm } from '../components/ResetPasswordForm';

export const ResetPasswordPage: React.FC = () => {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#000000]">
            <ResetPasswordForm />
        </div>
    );
};
