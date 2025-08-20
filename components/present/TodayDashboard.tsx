


import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import NaturalInputModal from '../NaturalInputModal';
import HabitTracker from './HabitTracker';
import DailyReview from './DailyReview';
import DailyLog from '../exercises/DailyLog';
import EnergyLog from '../exercises/EnergyLog';
import LifeCompassWidget from '../home/LifeCompassWidget';
import OneBreathPause from '../tools/OneBreathPause';
import ValuesWidget from './ValuesWidget';
import WeeklyRitualTrigger from '../planning/WeeklyRitualTrigger';
import RoutineTriggers from '../routines/RoutineTriggers';

const TodayDashboard: React.FC = () => {
    const { findLatestExerciseItem } = useAppContext();
    const { openModal } = useModal();
    
    const dailyLogData = findLatestExerciseItem('daily-log');
    const energyLogData = findLatestExerciseItem('energy-log');

    const handleQuickAdd = () => {
        openModal(<NaturalInputModal />);
    };

    return (
        <div className="space-y-6 glass-effect rounded-xl p-6 h-full">
             <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h2 className="text-2xl font-semibold brand-text">დღის დაფა</h2>
                <button 
                    onClick={handleQuickAdd}
                    className="p-2 bg-[var(--brand-color)] text-black rounded-lg text-sm font-semibold"
                >
                    სწრაფი დამატება
                </button>
            </div>
            
            <div className="space-y-6">
                <RoutineTriggers />
                <WeeklyRitualTrigger />
                <LifeCompassWidget />
                <ValuesWidget />
                <HabitTracker />
                <DailyReview />
                <DailyLog initialData={dailyLogData} />
                <EnergyLog initialData={energyLogData} />
                <OneBreathPause />
            </div>
        </div>
    );
};

export default TodayDashboard;
