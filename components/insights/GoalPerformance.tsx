
import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { generateGoalInsights } from '../../services/geminiService';
import { GoalInsightReport } from '../../types';

const GoalPerformance: React.FC = () => {
    const { lifeItems } = useAppContext();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GoalInsightReport | null>(null);

    const handleAnalyze = useCallback(async () => {
        const goals = lifeItems.filter(i => i.type === 'goal');
        if (goals.length < 3) {
            addToast('ანალიზისთვის საჭიროა მინიმუმ 3 მიზანი.', 'info');
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const dataSummary = `Goals data: ${goals.map(g => `{ title: "${g.title}", category: "${g.category}", createdAt: "${g.createdAt}", deadline: "${g.dateISO}", completed: ${g.subtasks?.every(s => s.completed) || false} }`).join('; ')}`;
            const analysis = await generateGoalInsights(dataSummary);
            setResult(analysis);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [lifeItems, addToast]);

     useEffect(() => {
        handleAnalyze();
    }, []);

    const StatCard: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
        <div className="bg-black/30 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold brand-text">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
        </div>
    );

    return (
        <div className="glass-effect rounded-xl p-6">
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xl font-semibold">მიზნების შესრულება 🎯</h3>
                <button onClick={handleAnalyze} disabled={isLoading} className="text-xs text-gray-400 hover:text-white disabled:opacity-50" title="განახლება">
                    <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 18"></path></svg>
                 </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">გააანალიზეთ თქვენი პროდუქტიულობა და მიზნების მიღწევის ტენდენციები.</p>

            {isLoading && <div className="text-center p-8"><span className="loader"></span></div>}
            
            {result && (
                <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard label="შესრულების დონე" value={`${Math.round(result.completionRate)}%`} />
                        <StatCard label="საშ. დრო (დღე)" value={result.avgCompletionTimeDays.toFixed(1)} />
                        <StatCard label="წარმატებული კატეგორია" value={result.mostSuccessfulCategory} />
                        <StatCard label="გამოწვევის კატეგორია" value={result.leastSuccessfulCategory} />
                    </div>
                     <div className="border-t border-white/10 pt-3">
                        <h4 className="font-semibold text-accent-color">AI დასკვნა:</h4>
                        <p className="text-sm italic text-gray-300">"{result.keyInsight}"</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoalPerformance;
