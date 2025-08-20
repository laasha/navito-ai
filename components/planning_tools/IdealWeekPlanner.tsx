import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { designIdealWeek } from '../../services/geminiService';
import { IdealWeekResponse } from '../../types';

const IdealWeekPlanner: React.FC = () => {
    const { addToast } = useToast();
    const [priorities, setPriorities] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<IdealWeekResponse | null>(null);

    const handleGenerate = async () => {
        if (!priorities.trim()) {
            addToast('გთხოვთ, ჩაწეროთ თქვენი პრიორიტეტები.', 'error');
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const response = await designIdealWeek(priorities);
            setResult(response);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">იდეალური კვირა</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">დააგეგმარეთ თქვენი იდეალური კვირა პრიორიტეტების მიხედვით. AI შექმნის სტრუქტურას, რომელიც შეგიძლიათ გამოიყენოთ შაბლონად.</p>
            
            <textarea
                value={priorities}
                onChange={e => setPriorities(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md h-20 mb-3"
                placeholder="ჩემი პრიორიტეტებია: დილის ვარჯიში, 2 საათი ღრმა მუშაობა პროექტზე, ოჯახთან დროის გატარება..."
            />
            <button onClick={handleGenerate} disabled={isLoading} className="w-full p-2 bg-accent-color text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isLoading ? <span className="loader mr-2"></span> : '🗓️'}
                კვირის დიზაინი
            </button>
            
            {result && (
                <div className="mt-4 space-y-3 animate-fade-in max-h-60 overflow-y-auto pr-2">
                    {result.schedule.map((day, index) => (
                        <div key={index} className="bg-black/20 p-3 rounded-lg">
                           <p className="font-bold text-brand-color">{day.day}: <span className="text-gray-300 font-normal">{day.focus}</span></p>
                           <ul className="list-disc pl-5 mt-1 text-sm text-gray-300">
                                {day.activities.map((activity, i) => <li key={i}>{activity}</li>)}
                           </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IdealWeekPlanner;
