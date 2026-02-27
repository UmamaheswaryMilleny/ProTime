import React from 'react';
import { SignupForm } from '../components/SignupForm';
import { AuthSideImage } from '../components/AuthSideImage';
import { AuthLayout } from '../layout/AuthLayout';

export const SignupPage: React.FC = () => {
    return (
        <AuthLayout>
            {/* Left Side - Image */}
            <AuthSideImage />

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 overflow-y-auto custom-scrollbar">
                <SignupForm />
            </div>
        </AuthLayout>
    );
};
