import React from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { HeroProgressCard } from '../components/HeroProgressCard';
import { TodaysTasksPanel } from '../components/TodaysTasksPanel';
import { StatsSnapshotGrid } from '../components/StatsSnapshotGrid';
import { BadgeProgress } from '../components/BadgeProgress';
import { MonthlySummary } from '../components/MonthlySummary';

export const DashboardPage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-10 pb-12">
            <DashboardHeader />
            <HeroProgressCard />
            <TodaysTasksPanel />
            <StatsSnapshotGrid />
            <BadgeProgress />
            <MonthlySummary />
        </div>
    );
};