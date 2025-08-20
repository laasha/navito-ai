import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { analyzeHolisticCorrelations } from '../../services/geminiService';
import { HolisticCorrelationReport, InsightCorrelation } from '../../types';

const StrengthIndicator: React.FC<{ strength: 'strong' | 'moderate' | 'weak' }> = ({ strength }) => {
    const strengthMap = {
        strong: { text: 'ძლიერი', color: 'text-accent-color' },
        moderate: { text: 'საშუალო', color: 'text-yellow-400' },
        weak: { text: 'სუსტი', color: 'text-gray-400' },
    };
    const { text, color } = strengthMap[strength];
    return <span className={`text-xs font-bold ${color}`}>{text}</span>;
};

const CorrelationCard: React.FC<{ correlation: InsightCorrelation; icon: string; }> = ({ correlation, icon }) => (
    <div className="bg-black/30 p-4 rounded-lg border-l-4 border-white/20">
        <div className="flex justify-between items-start">
            <p className="text-lg">{icon}</p>
            <StrengthIndicator strength={correlation.strength} />
        </div>
        <p className="font-semibold text-gray-200 mt-2">{correlation.finding}</p>
        <p className="text-sm text-gray-400 italic mt-1">"{correlation.evidence}"</p>
    </div>
);


const HolisticAnalysis: React.FC = () => {
    const { lifeItems, habits, biometricData } = useAppContext();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<HolisticCorrelationReport | null>(null);

    const handleAnalyze = useCallback(async () => {
        if (lifeItems.length < 5 || (habits.length < 1 && biometricData.length < 1)) {
            addToast('ანალიზისთვის არასაკმარისი მონაცემებია.', 'info');
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const bioMap = new Map(biometricData.map(d => [d.dateISO, d]));
            const dataSummary = `User's holistic data from last 90 days: ${lifeItems
                .filter(i => i.mood !== 0 && dayjs(i.dateISO).isAfter(dayjs().subtract(90, 'days')))
                .map(i => {
                    const date = dayjs(i.dateISO).format('YYYY-MM-DD');
                    const dayHabits = habits.filter(h => h.log.includes(date)).map(h => h.name);
                    const bio = bioMap.get(date);
                    let text = `On ${date}, mood was ${i.mood}. Habits: [${dayHabits.join(', ')}].`;
                    if (bio) {
                        text += ` Sleep: ${bio.sleepHours}h, Steps: ${bio.steps}, Avg HR: ${bio.avgHeartRate}bpm.`;
                    }
                    return text;
                }).join('; ')}`;
            
            const analysis = await analyzeHolisticCorrelations(dataSummary);
            setResult(analysis);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [lifeItems, habits, biometricData, addToast]);

    useEffect(() => {
        handleAnalyze();
    }, []);

    return (
        <div className="glass-effect rounded-xl p-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold">ჰოლისტური ანალიზი 🌐</h3>
                <button onClick={handleAnalyze} disabled={isLoading} className="text-xs text-gray-400 hover:text-white disabled:opacity-50" title="განახლება">
                    <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 18"></path></svg>
                 </button>
            </div>
             <p className="text-sm text-gray-400 mb-4">აღმოაჩინეთ კავშირები თქვენს ჩვევებს, განწყობას, ძილსა და აქტივობას შორის.</p>

            {isLoading && <div className="text-center p-8"><span className="loader w-8 h-8"></span></div>}

            {result && (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <h4 className="font-semibold text-green-400 mb-3">✅ პოზიტიური კავშირები</h4>
                        <div className="space-y-3">
                        {result.positiveCorrelations.length > 0 ? (
                            result.positiveCorrelations.map((corr, i) => <CorrelationCard key={i} correlation={corr} icon="✨" />)
                        ) : <p className="text-sm text-gray-500">მკაფიო პოზიტიური კავშირები ვერ მოიძებნა.</p>}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-red-400 mb-3">⚠️ გასაუმჯობესებელი სფეროები</h4>
                         <div className="space-y-3">
                        {result.negativeCorrelations.length > 0 ? (
                             result.negativeCorrelations.map((corr, i) => <CorrelationCard key={i} correlation={corr} icon="📉" />)
                        ) : <p className="text-sm text-gray-500">მკაფიო ნეგატიური კავშირები ვერ მოიძებნა.</p>}
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                         <div className="bg-brand-color/10 p-4 rounded-lg border-l-4 border-brand-color">
                            <p className="text-lg">💡</p>
                            <h4 className="font-semibold text-brand-color">მთავარი დასკვნა:</h4>
                            <p className="text-sm italic text-gray-300">"{result.keyInsight}"</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HolisticAnalysis;