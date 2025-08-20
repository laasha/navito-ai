
import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { analyzeMoodHabitCorrelation } from '../../services/geminiService';
import { MoodHabitCorrelation } from '../../types';

const CorrelationMatrix: React.FC = () => {
    const { lifeItems, habits } = useAppContext();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<MoodHabitCorrelation | null>(null);

    const handleAnalyze = useCallback(async () => {
        if (lifeItems.length < 5 || habits.length < 1) {
            addToast('ანალიზისთვის არასაკმარისი მონაცემებია (საჭიროა მინ. 5 ჩანაწერი განწყობით და 1 ჩვევა).', 'info');
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const dataSummary = `Habits: ${habits.map(h => h.name).join(', ')}. Mood/Habit data points: ${lifeItems.filter(i => i.mood !== 0).map(i => {
                const dayHabits = habits.filter(h => h.log.includes(dayjs(i.dateISO).format('YYYY-MM-DD'))).map(h => h.name);
                return `On ${i.dateISO}, mood was ${i.mood}, and habits were [${dayHabits.join(', ')}]`;
            }).join('; ')}`;
            
            const analysis = await analyzeMoodHabitCorrelation(dataSummary);
            setResult(analysis);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [lifeItems, habits, addToast]);

    useEffect(() => {
        handleAnalyze();
    }, []);

    return (
        <div className="glass-effect rounded-xl p-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold">ჩვევა-განწყობის ანალიზი 📈</h3>
                <button onClick={handleAnalyze} disabled={isLoading} className="text-xs text-gray-400 hover:text-white disabled:opacity-50" title="განახლება">
                    <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 18"></path></svg>
                 </button>
            </div>
             <p className="text-sm text-gray-400 mb-4">აღმოაჩინეთ, რომელი ჩვევები მოქმედებს თქვენს განწყობაზე.</p>

            {isLoading && <div className="text-center p-8"><span className="loader"></span></div>}

            {result && (
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <h4 className="font-semibold text-green-400">✅ პოზიტიური კავშირები</h4>
                        {result.positive.length > 0 ? (
                            result.positive.map((corr, i) => <p key={i} className="text-sm bg-black/20 p-2 rounded"><strong>{corr.habitName}:</strong> {corr.effectDescription}</p>)
                        ) : <p className="text-sm text-gray-500">მკაფიო პოზიტიური კავშირები ვერ მოიძებნა.</p>}
                    </div>
                     <div>
                        <h4 className="font-semibold text-red-400">❌ ნეგატიური/ნეიტრალური კავშირები</h4>
                        {result.negative.length > 0 ? (
                            result.negative.map((corr, i) => <p key={i} className="text-sm bg-black/20 p-2 rounded"><strong>{corr.habitName}:</strong> {corr.effectDescription}</p>)
                        ) : <p className="text-sm text-gray-500">მკაფიო ნეგატიური კავშირები ვერ მოიძებნა.</p>}
                    </div>
                    <div className="border-t border-white/10 pt-3">
                        <h4 className="font-semibold text-brand-color">AI შეჯამება:</h4>
                        <p className="text-sm italic text-gray-300">"{result.summary}"</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CorrelationMatrix;
