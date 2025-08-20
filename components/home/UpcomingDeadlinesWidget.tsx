import React from 'react';
import { useAppContext } from '../../context/AppContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const UpcomingDeadlinesWidget: React.FC = () => {
    const { lifeItems } = useAppContext();
    const now = dayjs();
    
    const upcomingGoals = lifeItems
        .filter(item => item.type === 'goal' && dayjs(item.dateISO).isAfter(now))
        .sort((a, b) => dayjs(a.dateISO).valueOf() - dayjs(b.dateISO).valueOf())
        .slice(0, 5);

    return (
        <div>
            <h3 className="text-lg font-semibold accent-text mb-2">მოახლოებული ვადები 🎯</h3>
            <div className="space-y-2 text-sm">
                {upcomingGoals.length > 0 ? (
                    upcomingGoals.map(goal => (
                        <div key={goal.id} className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                            <span className="font-medium">{goal.title}</span>
                            <span className="text-xs text-gray-400">{dayjs(goal.dateISO).fromNow()}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-xs p-2">აქტიური მიზნები ახლო მომავალში არ გაქვთ.</p>
                )}
            </div>
        </div>
    );
};

export default UpcomingDeadlinesWidget;
