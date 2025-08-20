import React, { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { generateWeeklyDigest } from '../../services/geminiService';
import { WeeklyDigestReport } from '../../types';

const ScoreBar: React.FC<{ score: number; label: string }> = ({ score, label }) => (
    <div>
        <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-300">{label}</span>
            <span className="text-sm font-medium text-brand-color">{score}/10</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-brand-color h-2.5 rounded-full" style={{ width: `${score * 10}%` }}></div>
        </div>
    </div>
);

const WeeklyDigest: React.FC = () => {
    const { lifeItems, habits } = useAppContext();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<WeeklyDigestReport | null>(null);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setReport(null);
        try {
            const sevenDaysAgo = dayjs().subtract(7, 'days');
            const recentItems = lifeItems.filter(i => dayjs(i.dateISO).isAfter(sevenDaysAgo));
            const recentHabits = habits.map(h => ({
                name: h.name,
                count: h.log.filter(l => dayjs(l).isAfter(sevenDaysAgo)).length,
            }));

            if (recentItems.length < 2) {
                addToast('ყოველკვირეული ანგარიშისთვის საკმარისი მონაცემები არ არის.', 'info');
                setIsLoading(false);
                return;
            }

            let dataSummary = `Items: ${recentItems.map(i => `- ${i.title} (Type: ${i.type}, Mood: ${i.mood})`).join('\n')}\n`;
            dataSummary += `Habits: ${recentHabits.map(h => `- ${h.name}: ${h.count} times`).join('\n')}`;

            const result = await generateWeeklyDigest(dataSummary);
            setReport(result);

        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [lifeItems, habits, addToast]);

    return (
        <div className="glass-effect rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-2">AI ყოველკვირეული დაიჯესტი 📰</h2>
            <p className="text-sm text-gray-400 mb-4">მიიღეთ გასული 7 დღის პერსონალური ანალიზი და რეკომენდაციები.</p>
            
            {!report && (
                <button
                    onClick={handleGenerate}
                    className="w-full p-3 bg-accent-color text-white rounded-lg font-semibold flex items-center justify-center disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? <span className="loader mr-2"></span> : '✨'}
                    {isLoading ? 'დაიჯესტი მზადდება...' : 'დაიჯესტის გენერაცია'}
                </button>
            )}

            {report && (
                <div className="animate-fade-in space-y-4">
                     <div className="text-center bg-black/20 p-4 rounded-lg">
                        <h3 className="text-2xl font-bold text-accent-color">{report.weekTitle}</h3>
                        <p className="text-sm text-gray-300 italic mt-2">"{report.summary}"</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <ScoreBar label="პროდუქტიულობა" score={report.productivityScore} />
                        <ScoreBar label="ბალანსი" score={report.balanceScore} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-green-400 mb-2">🏆 მიღწევები</h4>
                             <ul className="list-disc pl-5 space-y-1 text-sm">
                                {report.keyAchievements.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        <div>
                             <h4 className="font-semibold text-yellow-400 mb-2">🤔 რეფლექსიისთვის</h4>
                             <ul className="list-disc pl-5 space-y-1 text-sm">
                                {report.areasForReflection.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                    
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 p-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-lg">
                        {isLoading ? 'გენერირება...' : 'ხელახლა გენერირება'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default WeeklyDigest;