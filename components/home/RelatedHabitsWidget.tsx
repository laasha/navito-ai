import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { findRelatedHabits } from '../../services/geminiService';
import { LifeItem } from '../../types';
import dayjs from 'dayjs';

const RelatedHabitsWidget: React.FC<{ goal: LifeItem }> = ({ goal }) => {
    const { habits, saveHabits } = useAppContext();
    const [relatedHabits, setRelatedHabits] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const todayString = dayjs().format('YYYY-MM-DD');

    const getRelatedHabits = useCallback(async () => {
        setIsLoading(true);
        try {
            const allHabitNames = habits.map(h => h.name);
            if (allHabitNames.length === 0) {
                setRelatedHabits([]);
                return;
            }
            const result = await findRelatedHabits(goal.title, goal.payload?.details || '', allHabitNames);
            setRelatedHabits(result.relatedHabits);
        } catch (error) {
            console.error("Failed to find related habits:", error);
        } finally {
            setIsLoading(false);
        }
    }, [goal.title, goal.payload?.details, habits]);

    useEffect(() => {
        getRelatedHabits();
    }, [getRelatedHabits]);
    
    const handleToggle = async (habitName: string) => {
        const habitIndex = habits.findIndex(h => h.name === habitName);
        if (habitIndex === -1) return;

        const updatedHabits = JSON.parse(JSON.stringify(habits));
        const log = updatedHabits[habitIndex].log;
        const isChecked = log.includes(todayString);
        
        if (isChecked) {
            updatedHabits[habitIndex].log = log.filter((d: string) => d !== todayString);
        } else {
            log.push(todayString);
        }
        await saveHabits(updatedHabits);
    };

    if (isLoading) {
        return (
            <div>
                <h3 className="text-lg font-semibold accent-text mb-2">დაკავშირებული ჩვევები 🔗</h3>
                <div className="bg-black/20 p-3 rounded-lg min-h-[50px]">
                    <div className="flex items-center text-sm text-gray-400">
                        <span className="loader mr-2"></span>
                        <span>ანალიზი...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (relatedHabits.length === 0) {
        return null; // Don't show the widget if there are no related habits
    }

    return (
        <div>
            <h3 className="text-lg font-semibold accent-text mb-2">დაკავშირებული ჩვევები 🔗</h3>
            <div className="space-y-2 text-sm">
                {relatedHabits.map(habitName => {
                    const habit = habits.find(h => h.name === habitName);
                    if (!habit) return null;
                    const isChecked = habit.log.includes(todayString);
                    return (
                        <div key={habit.id} className="flex items-center bg-black/20 p-2 rounded-lg">
                            <input
                                type="checkbox"
                                id={`related-habit-${habit.id}`}
                                checked={isChecked}
                                onChange={() => handleToggle(habit.name)}
                                className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-brand-color focus:ring-brand-color"
                            />
                            <label htmlFor={`related-habit-${habit.id}`} className={`ml-3 flex-grow ${isChecked ? 'line-through text-gray-500' : ''}`}>
                                {habit.name}
                            </label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default RelatedHabitsWidget;