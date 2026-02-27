import React from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { PricingSection } from '../components/PricingSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { BlogSection } from '../components/BlogSection';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white font-poppins scroll-smooth">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <PricingSection />
            <TestimonialsSection />
            <BlogSection />
            <Footer />
        </div>
    );
};
