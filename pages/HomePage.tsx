import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAppContext } from '../context/AppContext';
import InitialLoader from '../components/InitialLoader';
import { useModal } from '../context/ModalContext';
import NaturalInputModal from '../components/NaturalInputModal';
import ProgramProgressWidget from '../components/home/ProgramProgressWidget';
import GoalListWithPinning from '../components/future/GoalListWithPinning';
import DailyVitalsWidget from '../components/home/DailyVitalsWidget';
import MindBodyConnectionWidget from '../components/home/MindBodyConnectionWidget';
import ValuesWidget from '../components/present/ValuesWidget';
import HabitTracker from '../components/present/HabitTracker';
import FocusToday from '../components/home/FocusToday';

// Header Component that dynamically changes based on user context
const DynamicHeader: React.FC = () => {
    const { lastQuarterlyReviewDate, userSettings } = useAppContext();
    const today = dayjs();

    const shouldDoQuarterlyReview = !lastQuarterlyReviewDate || today.diff(dayjs(lastQuarterlyReviewDate), 'day') > 85;
    if (shouldDoQuarterlyReview) {
        return (
            <div className="bg-gradient-to-r from-purple-900/50 via-accent-color/30 to-purple-900/50 p-6 rounded-xl border-2 border-accent-color/50 text-center animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-2">🪐 დროა კვარტალური მიმოხილვის!</h2>
                <p className="text-gray-300 mb-4 max-w-2xl mx-auto">გააანალიზეთ გასული 90 დღე, შეაფასეთ პროგრესი და დასახეთ სტრატეგიული მიზნები მომდევნო ეპოქისთვის.</p>
                <Link 
                    to="/review/quarterly"
                    className="inline-block px-6 py-3 bg-accent-color text-white rounded-lg font-semibold hover:bg-fuchsia-500 transition-colors shadow-lg"
                >
                    ღრმა ანალიზის დაწყება
                </Link>
            </div>
        );
    }
    
    const greeting = `მოგესალმებით, ${userSettings.userName || 'მეგობარო'}!`;

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold brand-text">{greeting}</h1>
            <p className="text-gray-400 italic">"{userSettings.userQuote}"</p>
        </div>
    );
};

// Quick Add Component for natural language input
const QuickAddComponent: React.FC = () => {
    const { openModal } = useModal();
    return (
        <div className="my-6">
            <input
                type="text"
                readOnly
                onClick={() => openModal(<NaturalInputModal />)}
                placeholder="რა გსურთ, რომ დაამატოთ? მიზანი, იდეა, მოვლენა..."
                className="w-full p-4 bg-black/30 border-2 border-dashed border-white/20 rounded-lg text-center cursor-pointer hover:border-brand-color focus:outline-none focus:border-brand-color transition-colors"
            />
        </div>
    );
};

// Main layout for when no specific goal is pinned
const OverviewDashboard: React.FC = () => {
    const { activeProgram, userSettings } = useAppContext();
     return (
        <div className="animate-slide-in-up">
            <QuickAddComponent />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {activeProgram && <ProgramProgressWidget program={activeProgram} />}
                    <GoalListWithPinning />
                </div>
                {/* Sidebar Column */}
                <div className="lg:col-span-1 space-y-6">
                    <DailyVitalsWidget />
                    <MindBodyConnectionWidget />
                    {userSettings.values?.length > 0 && <ValuesWidget />}
                    <HabitTracker />
                </div>
            </div>
        </div>
    );
};

// Main layout for when a goal IS pinned
const FocusDashboard: React.FC = () => {
    const { pinnedGoalId, getLifeItemById } = useAppContext();
    const pinnedGoal = pinnedGoalId ? getLifeItemById(pinnedGoalId) : null;
    
    if (!pinnedGoal) {
        // This can happen briefly if the goal is unpinned. Fallback to overview.
        return <OverviewDashboard />;
    }

    return (
        <div className="animate-slide-in-up">
            <FocusToday goal={pinnedGoal} />
        </div>
    );
};

const HomePage: React.FC = () => {
    const { isLoading, pinnedGoalId } = useAppContext();

    if (isLoading) {
        return <InitialLoader />;
    }

    return (
        <div className="h-full space-y-6">
            <DynamicHeader />
            {pinnedGoalId ? <FocusDashboard /> : <OverviewDashboard />}
        </div>
    );
};

export default HomePage;
