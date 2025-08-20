
import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';

const HabitHeatmap: React.FC = () => {
    const { habits } = useAppContext();
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(habits[0]?.id || null);

    const yearAgo = dayjs().subtract(1, 'year').startOf('day');
    const today = dayjs().endOf('day');

    const calendarData = useMemo(() => {
        if (!selectedHabitId) return { days: [], counts: new Map<string, number>() };
        const selectedHabit = habits.find(h => h.id === selectedHabitId);
        if (!selectedHabit) return { days: [], counts: new Map<string, number>() };

        const days = [];
        let day = yearAgo;
        while(day.isBefore(today)) {
            days.push(day);
            day = day.add(1, 'day');
        }

        const counts = new Map<string, number>();
        for (const log of selectedHabit.log) {
            const date = dayjs(log).format('YYYY-MM-DD');
            counts.set(date, (counts.get(date) || 0) + 1);
        }

        return { days, counts };
    }, [selectedHabitId, habits, yearAgo, today]);
    
    const { days, counts } = calendarData;
    
    const getColor = (count: number) => {
        if (count > 4) return 'bg-brand-color';
        if (count > 2) return 'bg-brand-color/80';
        if (count > 0) return 'bg-brand-color/60';
        return 'bg-white/10';
    };

    return (
        <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-2">ჩვევების სიმძლავრის რუკა 🔥</h3>
             <p className="text-sm text-gray-400 mb-4">ვიზუალური წარმოდგენა თქვენი თანმიმდევრულობისა გასული წლის განმავლობაში.</p>
            
            <select
                value={selectedHabitId || ''}
                onChange={(e) => setSelectedHabitId(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md mb-4"
            >
                {habits.map(habit => (
                    <option key={habit.id} value={habit.id}>{habit.name}</option>
                ))}
            </select>
            
            {selectedHabitId ? (
                <div
                    className="grid gap-1 overflow-x-auto"
                    style={{ gridTemplateColumns: 'repeat(53, minmax(0, 1fr))' }}
                >
                    {days.map(day => {
                        const count = counts.get(day.format('YYYY-MM-DD')) || 0;
                        return (
                            <div
                                key={day.format('YYYY-MM-DD')}
                                className={`w-3 h-3 rounded-sm ${getColor(count)}`}
                                title={`${day.format('DD MMMM, YYYY')}: ${count} раз`}
                            />
                        );
                    })}
                </div>
            ) : (
                <p className="text-gray-500">აირჩიეთ ჩვევა რუკის სანახავად.</p>
            )}
        </div>
    );
};

export default HabitHeatmap;