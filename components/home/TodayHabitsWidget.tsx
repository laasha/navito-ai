import React from 'react';
import { useAppContext } from '../../context/AppContext';
import dayjs from 'dayjs';

const TodayHabitsWidget: React.FC = () => {
    const { habits, saveHabits } = useAppContext();
    const todayString = dayjs().format('YYYY-MM-DD');

    const handleCheckboxChange = async (habitIndex: number, isChecked: boolean) => {
        const updatedHabits = JSON.parse(JSON.stringify(habits));
        const log = updatedHabits[habitIndex].log;
        if (isChecked) {
            if (!log.includes(todayString)) {
                log.push(todayString);
            }
        } else {
            updatedHabits[habitIndex].log = log.filter((d: string) => d !== todayString);
        }
        await saveHabits(updatedHabits);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold accent-text mb-2">დღევანდელი ჩვევები 🏃‍♂️</h3>
            <div className="space-y-2 text-sm">
                {habits.length > 0 ? (
                    habits.map((habit, index) => {
                        const isChecked = habit.log.includes(todayString);
                        return (
                             <div key={habit.id} className="flex items-center bg-black/20 p-2 rounded-lg">
                                <input
                                    type="checkbox"
                                    id={`habit-widget-${habit.id}`}
                                    checked={isChecked}
                                    onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                                    className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-brand-color focus:ring-brand-color focus:ring-2 cursor-pointer"
                                />
                                <label htmlFor={`habit-widget-${habit.id}`} className={`ml-3 flex-grow cursor-pointer ${isChecked ? 'line-through text-gray-500' : ''}`}>
                                    {habit.name}
                                </label>
                            </div>
                        )
                    })
                ) : (
                    <p className="text-gray-500 text-xs p-2">ტრეკინგისთვის ჩვევები არ გაქვთ დამატებული.</p>
                )}
            </div>
        </div>
    );
};

export default TodayHabitsWidget;
