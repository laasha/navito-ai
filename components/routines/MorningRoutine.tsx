
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { generateDailyBriefing } from '../../services/geminiService';
import { DailyBriefing } from '../../types';
import OneBreathPause from '../tools/OneBreathPause';

const MorningRoutine: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const { lifeItems, habits, pinnedGoalId, getLifeItemById, saveHabits } = useAppContext();
    const [step, setStep] = useState(0);
    const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const todayString = dayjs().format('YYYY-MM-DD');

    useEffect(() => {
        const pinnedGoal = pinnedGoalId ? getLifeItemById(pinnedGoalId) : null;
        const upcomingDeadlines = lifeItems.filter(i => 
            i.type === 'goal' && dayjs(i.dateISO).isAfter(dayjs()) && dayjs(i.dateISO).isBefore(dayjs().add(7, 'day'))
        ).length;
        const todaysHabits = habits.map(h => h.name);

        generateDailyBriefing(pinnedGoal?.title || null, upcomingDeadlines, todaysHabits)
            .then(setBriefing)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [pinnedGoalId, getLifeItemById, lifeItems, habits]);
    
    const handleHabitToggle = async (habitIndex: number, isChecked: boolean) => {
        const updatedHabits = JSON.parse(JSON.stringify(habits));
        const log = updatedHabits[habitIndex].log;
        if (isChecked) {
            if (!log.includes(todayString)) log.push(todayString);
        } else {
            updatedHabits[habitIndex].log = log.filter((d: string) => d !== todayString);
        }
        await saveHabits(updatedHabits);
    };

    const renderStep = () => {
        switch (step) {
            case 0: // Welcome & Briefing
                return (
                    <div className="text-center animate-fade-in">
                        {isLoading ? (
                            <>
                                <div className="loader inline-block w-8 h-8 mb-4"></div>
                                <p className="text-lg text-gray-300">თქვენი დღე მზადდება...</p>
                            </>
                        ) : briefing ? (
                            <>
                                <h2 className="text-3xl font-bold text-white mb-2">{briefing.greeting}</h2>
                                <p className="text-lg text-gray-300 mb-4">{briefing.focus_statement}</p>
                                <p className="text-md italic text-brand-color">"{briefing.motivational_prompt}"</p>
                            </>
                        ) : (
                            <p className="text-lg text-gray-400">ბრიფინგის ჩატვირთვა ვერ მოხერხდა.</p>
                        )}
                    </div>
                );
            case 1: // Habits
                return (
                     <div className="animate-fade-in w-full max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-center text-white mb-4">დღევანდელი ჩვევები</h2>
                         <div className="space-y-3">
                             {habits.map((habit, index) => (
                                 <div key={habit.id} className="flex items-center bg-black/20 p-3 rounded-lg">
                                     <input
                                         type="checkbox"
                                         id={`routine-habit-${habit.id}`}
                                         defaultChecked={habit.log.includes(todayString)}
                                         onChange={(e) => handleHabitToggle(index, e.target.checked)}
                                         className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-brand-color focus:ring-brand-color"
                                     />
                                     <label htmlFor={`routine-habit-${habit.id}`} className="ml-3 flex-grow">{habit.name}</label>
                                 </div>
                             ))}
                             {habits.length === 0 && <p className="text-center text-gray-500">დასაწყებად დაამატეთ ჩვევები.</p>}
                        </div>
                    </div>
                );
            case 2: // Mindfulness
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-center text-white mb-4">დაიწყე სიმშვიდით</h2>
                        <OneBreathPause />
                    </div>
                );
            case 3: // Finish
                return (
                    <div className="text-center animate-fade-in">
                        <h2 className="text-3xl font-bold text-white mb-4">ყველაფერი მზადაა!</h2>
                        <p className="text-lg text-gray-300">გისურვებთ პროდუქტიულ და ბედნიერ დღეს.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-between h-[80vh] w-full">
            <div className="flex-grow flex items-center justify-center w-full">
                {renderStep()}
            </div>
            <div className="flex-shrink-0">
                {step < 3 ? (
                    <button onClick={() => setStep(s => s + 1)} className="px-6 py-2 bg-brand-color text-black rounded-lg font-semibold">შემდეგი</button>
                ) : (
                    <button onClick={onExit} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold">დასრულება</button>
                )}
            </div>
        </div>
    );
};

export default MorningRoutine;
