import React from 'react';
import { SigninForm } from '../components/SigninForm';
import { AuthSideImage } from '../components/AuthSideImage';
import { AuthLayout } from '../layout/AuthLayout';
import { signinSlides } from '../data/carousel.data';

export const SigninPage: React.FC = () => {
    return (
        <AuthLayout>
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 overflow-y-auto custom-scrollbar">
                <SigninForm />
            </div>

            {/* Right Side - Image */}
            <AuthSideImage slides={signinSlides} />
        </AuthLayout>
    );
};
