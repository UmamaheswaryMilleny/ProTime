import React from 'react';
import { OtpVerificationForm } from '../components/OtpVerificationForm';

export const OtpVerificationPage: React.FC = () => {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#000000]">
            <OtpVerificationForm />
        </div>
    );
};
