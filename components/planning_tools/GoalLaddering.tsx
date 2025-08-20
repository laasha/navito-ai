import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { generateGoalLadder } from '../../services/geminiService';
import { GoalLadderResponse } from '../../types';

const GoalLaddering: React.FC = () => {
    const { addToast } = useToast();
    const [goal, setGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GoalLadderResponse | null>(null);

    const handleGenerate = async () => {
        if (!goal.trim()) {
            addToast('გთხოვთ, ჩაწეროთ მიზანი.', 'error');
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const response = await generateGoalLadder(goal);
            setResult(response);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">მიზნის კიბე</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">დაშალეთ დიდი, ამბიციური მიზანი პატარა, მართვად ნაბიჯებად, რათა პროცესი უფრო გასაგები და ნაკლებად სტრესული გახდეს.</p>
            
            <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md h-20 mb-3"
                placeholder="ჩემი დიდი მიზანია..."
            />
            <button onClick={handleGenerate} disabled={isLoading} className="w-full p-2 bg-accent-color text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isLoading ? <span className="loader mr-2"></span> : '🪜'}
                მიზნის დაშლა
            </button>
            
            {result && (
                <div className="mt-4 space-y-3 animate-fade-in max-h-60 overflow-y-auto pr-2">
                    {result.steps.map((step, index) => (
                        <div key={index} className="bg-black/20 p-3 rounded-lg">
                           <p className="font-bold text-brand-color">{index + 1}. {step.title}</p>
                           <ul className="list-disc pl-5 mt-1 text-sm text-gray-300">
                                {step.subSteps.map((subStep, i) => <li key={i}>{subStep}</li>)}
                           </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GoalLaddering;
