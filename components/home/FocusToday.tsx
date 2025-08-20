import React from 'react';
import { LifeItem } from '../../types';
import PinnedGoalWidget from './PinnedGoalWidget';
import NextStepWidget from './NextStepWidget';
import AiInsightWidget from './AiInsightWidget';
import RelatedHabitsWidget from './RelatedHabitsWidget';
import ConnectedEventsWidget from './ConnectedEventsWidget';

interface FocusTodayProps {
    goal: LifeItem;
}

const FocusToday: React.FC<FocusTodayProps> = ({ goal }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left (main) column */}
            <div className="lg:col-span-3 space-y-6">
                <PinnedGoalWidget goal={goal} />
                <ConnectedEventsWidget goal={goal} />
            </div>
            {/* Right (sidebar) column */}
            <div className="lg:col-span-2 space-y-6">
                <NextStepWidget goal={goal} />
                <RelatedHabitsWidget goal={goal} />
                <AiInsightWidget />
            </div>
        </div>
    );
};

export default FocusToday;