
import React, { useState, useEffect, useCallback } from 'react';
import { LifeItem } from '../../types';
import { generateNextStepForGoal } from '../../services/geminiService';
import { useToast } from '../../context/ToastContext';
import { useAppContext } from '../../context/AppContext';

const NextStepWidget: React.FC<{ goal: LifeItem }> = ({ goal }) => {
    const { addOrUpdateLifeItem } = useAppContext();
    const { addToast } = useToast();
    const [nextStep, setNextStep] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const getNextStep = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await generateNextStepForGoal(goal);
            setNextStep(result);
        } catch (error: any) {
            console.error("Failed to get next step:", error);
            setNextStep("რეკომენდაციის მიღებისას შეცდომა მოხდა.");
        } finally {
            setIsLoading(false);
        }
    }, [goal]);

    useEffect(() => {
        getNextStep();
    }, [getNextStep]);

    const addAsSubtask = async () => {
        const newSubtasks = [...(goal.subtasks || []), { text: nextStep, completed: false }];
        await addOrUpdateLifeItem({ ...goal, subtasks: newSubtasks });
        addToast("ქვე-დავალება დაემატა!", 'success');
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center text-sm text-gray-400">
                    <span className="loader mr-2"></span>
                    <span>ნაბიჯის მოძიება...</span>
                </div>
            );
        }
        return <p className="text-sm text-gray-300">{nextStep}</p>;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-lg font-semibold accent-text">შემდეგი ნაბიჯი 💡</h3>
                 <button onClick={getNextStep} disabled={isLoading} className="text-xs text-gray-400 hover:text-white disabled:opacity-50" title="განახლება">
                    <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 18"></path></svg>
                 </button>
            </div>
            <div className="bg-black/20 p-3 rounded-lg min-h-[70px]">
                {renderContent()}
            </div>
            {!isLoading && nextStep && (
                <button 
                    onClick={addAsSubtask}
                    className="mt-2 w-full p-2 text-xs bg-brand-color/80 text-black rounded-lg font-semibold hover:bg-brand-color"
                >
                    ქვე-დავალებად დამატება +
                </button>
            )}
        </div>
    );
};

export default NextStepWidget;
