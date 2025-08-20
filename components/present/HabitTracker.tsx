import React, { useState } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

dayjs.extend(isoWeek);

const HabitTracker: React.FC = () => {
    const { habits, saveHabits } = useAppContext();
    const { addToast } = useToast();
    const [newHabitName, setNewHabitName] = useState('');

    const today = dayjs();
    const startOfWeek = today.startOf('isoWeek');
    const weekDays = Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'));

    const handleCheckboxChange = async (habitIndex: number, dateString: string, isChecked: boolean) => {
        const updatedHabits = habits.map((habit, index) => {
            if (index !== habitIndex) {
                return habit;
            }

            const log = habit.log;
            let newLog;

            if (isChecked) {
                newLog = log.includes(dateString) ? [...log] : [...log, dateString];
            } else {
                newLog = log.filter(d => d !== dateString);
            }
            
            return { ...habit, log: newLog };
        });
        await saveHabits(updatedHabits);
    };

    const handleAddHabit = async () => {
        if (newHabitName.trim()) {
            const newHabit = {
                id: `habit_${Date.now()}`,
                name: newHabitName.trim(),
                log: [],
            };
            await saveHabits([...habits, newHabit]);
            setNewHabitName('');
            addToast('ჩვევა დაემატა!', 'success');
        }
    };
    
    const handleRemoveHabit = async (habitIndex: number) => {
        const habitToRemove = habits[habitIndex];
        if (window.confirm(`დარწმუნებული ხართ, რომ გსურთ წაშალოთ ჩვევა "${habitToRemove.name}"?`)) {
            const updatedHabits = habits.filter((_, index) => index !== habitIndex);
            await saveHabits(updatedHabits);
            addToast('ჩვევა წაიშალა!', 'info');
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">ჩვევების ტრეკერი</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                    <thead>
                        <tr>
                            <th className="pb-2">ჩვევა</th>
                            {weekDays.map(day => (
                                <th key={day.format('YYYY-MM-DD')} className="pb-2 text-center text-xs text-gray-400">
                                    {day.format('ddd')}<br/>{day.format('D')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {habits.map((habit, habitIndex) => (
                            <tr key={habit.id} className="border-b border-white/10">
                                <td className="py-2 pr-2 flex items-center group">
                                    <span className="flex-grow">{habit.name}</span>
                                    <button onClick={() => handleRemoveHabit(habitIndex)} className="ml-2 text-gray-600 hover:text-red-500 text-xl opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                </td>
                                {weekDays.map(day => {
                                    const dateString = day.format('YYYY-MM-DD');
                                    const isChecked = habit.log.includes(dateString);
                                    return (
                                        <td key={dateString} className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => handleCheckboxChange(habitIndex, dateString, e.target.checked)}
                                                className="appearance-none w-8 h-8 border-2 border-white/20 rounded-lg cursor-pointer transition-all hover:border-brand-color checked:bg-brand-color checked:border-brand-color relative checked:after:content-['✔'] checked:after:text-black checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-xl checked:after:font-bold"
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex mt-4">
                <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddHabit()}
                    className="p-2 bg-black/30 border-white/10 rounded-l-md w-full"
                    placeholder="ახალი ჩვევა..."
                />
                <button onClick={handleAddHabit} className="p-2 bg-brand-color text-black rounded-r-md text-sm font-semibold">დამატება</button>
            </div>
        </div>
    );
};

export default HabitTracker;