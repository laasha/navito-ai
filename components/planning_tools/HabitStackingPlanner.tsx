import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { suggestHabitStacks } from '../../services/geminiService';
import { HabitStackResponse } from '../../types';
import { useAppContext } from '../../context/AppContext';

const HabitStackingPlanner: React.FC = () => {
    const { addToast } = useToast();
    const { habits } = useAppContext();
    const [newHabit, setNewHabit] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<HabitStackResponse | null>(null);

    const currentHabitsString = habits.map(h => h.name).join(', ');

    const handleGenerate = async () => {
        if (!newHabit.trim()) {
            addToast('გთხოვთ, ჩაწეროთ ახალი ჩვევა.', 'error');
            return;
        }
        if (habits.length === 0) {
            addToast('ამ ხელსაწყოსთვის საჭიროა მინიმუმ ერთი არსებული ჩვევა.', 'info');
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const response = await suggestHabitStacks(currentHabitsString, newHabit);
            setResult(response);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">ჩვევების დაწყვილება</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">იპოვეთ შესაძლებლობები, რომ ახალი ჩვევები არსებულს მიაბათ და გაზარდოთ წარმატების შანსი.</p>
            
            <input
                type="text"
                value={newHabit}
                onChange={e => setNewHabit(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md h-12 mb-3"
                placeholder="ახალი ჩვევა, რომლის დამატებაც გსურთ"
            />
            <button onClick={handleGenerate} disabled={isLoading} className="w-full p-2 bg-accent-color text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isLoading ? <span className="loader mr-2"></span> : '🔗'}
                შემოთავაზებების მიღება
            </button>
            
            {result && (
                <div className="mt-4 space-y-3 animate-fade-in max-h-60 overflow-y-auto pr-2">
                    {result.stacks.map((stack, index) => (
                        <div key={index} className="bg-black/20 p-3 rounded-lg">
                           <p className="text-sm text-gray-300">{stack.suggestion}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HabitStackingPlanner;
