

import React from 'react';
import HabitHeatmap from '../components/insights/HabitHeatmap';
import GoalPerformance from '../components/insights/GoalPerformance';
import LifeWheelEvolution from '../components/insights/LifeWheelEvolution';
import HolisticAnalysis from '../components/insights/HolisticAnalysis';
import UniversalSearch from '../components/insights/UniversalSearch';
import WeeklyDigest from '../components/insights/WeeklyDigest';

interface PastPageProps {
    isTabbed?: boolean;
}

const PastPage: React.FC<PastPageProps> = ({ isTabbed = false }) => {
    return (
        <div className="space-y-8">
            {!isTabbed && (
                <div className="text-center">
                    <h1 className="text-3xl font-bold accent-text">ინსაითები და მეხსიერება 🧠</h1>
                    <p className="text-gray-400 max-w-3xl mx-auto mt-2">
                        აქციეთ თქვენი მონაცემები სიბრძნედ. გამოიყენეთ უნივერსალური ძიება თქვენს ციფრულ მეხსიერებაში ნავიგაციისთვის, ან გამოიკვლიეთ AI-ს მიერ გენერირებული ანალიტიკა.
                    </p>
                </div>
            )}
            
            <WeeklyDigest />
            <UniversalSearch />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <HolisticAnalysis />
                    <GoalPerformance />
                </div>
                <div className="space-y-8">
                    <LifeWheelEvolution />
                    <HabitHeatmap />
                </div>
            </div>
        </div>
    );
};

export default PastPage;