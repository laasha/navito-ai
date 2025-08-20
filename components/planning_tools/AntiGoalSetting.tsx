import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { generateAntiGoals } from '../../services/geminiService';
import { AntiGoalResponse } from '../../types';

const AntiGoalSetting: React.FC = () => {
    const { addToast } = useToast();
    const [goal, setGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AntiGoalResponse | null>(null);

    const handleGenerate = async () => {
        if (!goal.trim()) {
            addToast('გთხოვთ, აღწეროთ მიზანი, რომლის საპირისპირო სცენარის ნახვაც გსურთ.', 'error');
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const response = await generateAntiGoals(goal);
            setResult(response);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">ანტი-მიზნები</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">განსაზღვრეთ, რისი თავიდან აცილება გსურთ, რათა უკეთ დაინახოთ რეალური მიზნები და პოტენციური რისკები.</p>
            
            <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md h-20 mb-3"
                placeholder="ჩემი მიზანია..."
            />
            <button onClick={handleGenerate} disabled={isLoading} className="w-full p-2 bg-accent-color text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isLoading ? <span className="loader mr-2"></span> : '🧐'}
                ანტი-მიზნების გენერაცია
            </button>
            
            {result && (
                <div className="mt-4 space-y-3 animate-fade-in max-h-60 overflow-y-auto pr-2">
                    {result.antiGoals.map((ag, index) => (
                        <div key={index} className="bg-black/20 p-3 rounded-lg">
                           <p className="font-bold text-red-400">თავიდან ასაცილებელი: {ag.antiGoal}</p>
                           <ul className="list-disc pl-5 mt-1 text-sm text-gray-300">
                                {ag.preventativeActions.map((action, i) => <li key={i}>{action}</li>)}
                           </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AntiGoalSetting;
