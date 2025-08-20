import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAppContext } from '../../context/AppContext';
import { generateEpochGoal } from '../../services/geminiService';
import { EpochGoal } from '../../types';
import dayjs from 'dayjs';

const EpochGoalSetter: React.FC = () => {
    const { addToast } = useToast();
    const { addOrUpdateLifeItem } = useAppContext();
    const [description, setDescription] = useState('');
    const [result, setResult] = useState<EpochGoal | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!description.trim()) {
            addToast('გთხოვთ, აღწეროთ მიზანი.', 'error');
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const response = await generateEpochGoal(description);
            setResult(response);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!result) return;
        try {
            const details = `**მიზეზი:**\n${result.reason}`;
            const subtasks = result.firstSteps.map(step => ({ text: step, completed: false }));
            
            await addOrUpdateLifeItem({
                type: 'goal',
                title: result.title,
                dateISO: dayjs().add(90, 'days').toISOString(),
                category: 'impact',
                payload: {
                    details,
                },
                subtasks,
            });
            addToast(`90-დღიანი მიზანი "${result.title}" შენახულია!`, 'success');
            setResult(null);
            setDescription('');
        } catch (error: any) {
            addToast(error.message, 'error');
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">ეპოქის მიზანი (90 დღე)</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">განსაზღვრეთ თქვენი მთავარი ფოკუსი მომდევნო კვარტლისთვის.</p>
            
            {!result && (
                <>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full p-2 bg-black/30 border-white/10 rounded-md h-24 mb-3"
                        placeholder="ჩემი მთავარი მიზანია..."
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full p-2 bg-accent-color text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                        {isLoading ? <span className="loader mr-2"></span> : '🎯'}
                        მიზნის ფორმულირება
                    </button>
                </>
            )}

            {result && (
                <div className="animate-fade-in space-y-3">
                    <h4 className="text-lg font-bold brand-text">{result.title}</h4>
                    <p className="text-sm italic text-gray-300">"{result.reason}"</p>
                    <div>
                        <h5 className="font-semibold">პირველი ნაბიჯები:</h5>
                        <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
                            {result.firstSteps.map((step, i) => <li key={i}>{step}</li>)}
                        </ul>
                    </div>
                    <button onClick={handleSave} className="w-full mt-2 p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm">
                        მიზნად შენახვა
                    </button>
                </div>
            )}
        </div>
    );
};

export default EpochGoalSetter;
