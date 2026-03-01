import React from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { GettingStartedWidget } from '../components/GettingStartedWidget';
import { StudyTogetherWidget } from '../components/StudyTogetherWidget';
import { TodayOverviewWidget } from '../components/TodayOverviewWidget';
import { SuggestedBuddiesWidget } from '../components/SuggestedBuddiesWidget';
import { ProductivityStreakWidget } from '../components/ProductivityStreakWidget';
import { ReputationWidget } from '../components/ReputationWidget';
import { AiAssistantWidget } from '../components/AiAssistantWidget';
import { DailyQuoteWidget } from '../components/DailyQuoteWidget';

export const DashboardPage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto">
            <DashboardHeader />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column — main content */}
                <div className="lg:col-span-2 space-y-8">
                    <GettingStartedWidget />
                    <StudyTogetherWidget />
                    <TodayOverviewWidget />
                </div>

                {/* Right Column — widgets */}
                <div className="space-y-6">
                    <SuggestedBuddiesWidget />
                    <ProductivityStreakWidget />
                    <ReputationWidget />
                    <AiAssistantWidget />
                    <DailyQuoteWidget />
                </div>
            </div>
        </div>
    );
};