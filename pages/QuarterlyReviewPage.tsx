

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { generateQuarterlyReview } from '../services/geminiService';
import { QuarterlyReviewReport } from '../types';

const QuarterlyReviewPage: React.FC = () => {
    const { lifeItems, habits, userSettings, setLastQuarterlyReviewDate } = useAppContext();
    const { addToast } = useToast();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [report, setReport] = useState<QuarterlyReviewReport | null>(null);

    const ninetyDaysAgo = useMemo(() => dayjs().subtract(90, 'days'), []);

    useEffect(() => {
        const generateReport = async () => {
            const items = lifeItems.filter(i => dayjs(i.dateISO).isAfter(ninetyDaysAgo));
            const habitData = habits.map(h => ({
                name: h.name,
                count: h.log.filter(l => dayjs(l).isAfter(ninetyDaysAgo)).length,
            }));

            if (items.length < 5) {
                 addToast('კვარტალური ანგარიშისთვის საკმარისი მონაცემები არ არის.', 'error');
                 navigate('/home');
                 return;
            }

            let dataSummary = `მოვლენები და მიზნები:\n${items.map(i => `- ${i.title} (განწყობა: ${i.mood})`).join('\n')}\n\n`;
            dataSummary += `ჩვევები:\n${habitData.map(h => `- ${h.name}: ${h.count} ჯერ`).join('\n')}`;
            
            try {
                const result = await generateQuarterlyReview(dataSummary, userSettings.values);
                setReport(result);
            } catch (error: any) {
                addToast(error.message, 'error');
                navigate('/home');
            } finally {
                setIsLoading(false);
            }
        };

        generateReport();
    }, [lifeItems, habits, userSettings.values, ninetyDaysAgo, addToast, navigate]);

    const handleFinish = async () => {
        await setLastQuarterlyReviewDate(dayjs().toISOString());
        addToast('კვარტალური მიმოხილვა დასრულებულია!', 'success');
        navigate('/home');
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="loader inline-block w-12 h-12 border-4 mb-4"></div>
                <p className="text-lg text-gray-300 animate-pulse">თქვენი კვარტალური ანგარიში მზადდება...</p>
                <p className="text-sm text-gray-500">ამას შეიძლება ერთ წუთამდე დასჭირდეს.</p>
            </div>
        );
    }
    
    if (!report) {
         return <div className="text-center">ანგარიშის ჩატვირთვა ვერ მოხერხდა.</div>
    }

    const renderStepContent = () => {
        switch (step) {
            case 0: // Summary
                return (
                    <div className="prose prose-invert lg:prose-xl">
                        <h2 className="text-accent-color">{report.title}</h2>
                        <p className="text-sm text-gray-400">პერიოდი: {ninetyDaysAgo.format('DD MMM YYYY')} - {dayjs().format('DD MMM YYYY')}</p>
                        <p>{report.summary}</p>
                    </div>
                );
            case 1: // Achievements & Challenges
                return (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-2xl font-bold text-green-400 mb-4">მთავარი მიღწევები 🏆</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                {report.keyAchievements.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        <div>
                             <h3 className="text-2xl font-bold text-red-400 mb-4">მთავარი გამოწვევები 🧗</h3>
                             <ul className="list-disc pl-5 space-y-2">
                                {report.keyChallenges.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                );
            case 2: // Value Alignment
                return (
                     <div>
                        <h3 className="text-2xl font-bold text-brand-color mb-4">ღირებულებებთან შესაბამისობა 🧭</h3>
                        <div className="space-y-4">
                            {report.valueAlignment.map((item, i) => (
                                <div key={i} className="bg-black/20 p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-lg font-semibold">{item.value}</h4>
                                        <div className="w-24 bg-gray-700 rounded-full h-2.5">
                                            <div className="bg-brand-color h-2.5 rounded-full" style={{ width: `${item.score * 10}%` }}></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 italic mt-2">"{item.narrative}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 3: // Next Steps
                 return (
                     <div className="text-center">
                        <h3 className="text-2xl font-bold text-accent-color mb-4">შემდეგი ეპოქის ფოკუსი 🚀</h3>
                        <p className="mb-4">დაყრდნობით ამ ანალიზზე, AI გირჩევთ, ფოკუსირდეთ შემდეგ სფეროებზე:</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {report.suggestedFocusAreas.map((item, i) => (
                                <span key={i} className="px-4 py-2 bg-purple-600/50 text-white rounded-full text-lg">{item}</span>
                            ))}
                        </div>
                         <p className="mt-8 text-gray-400">გამოიყენეთ ეს ანალიზი შემდეგი 90 დღის დასაგეგმად. დაისახეთ 1-3 მთავარი მიზანი "მომავლის" გვერდზე.</p>
                    </div>
                );
        }
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-8">
            <h1 className="text-3xl font-bold brand-text text-center mb-6">🪐 კვარტალური მიმოხილვა ("Epoch Review")</h1>
            
            <div className="flex-grow flex items-center justify-center w-full max-w-4xl mx-auto">
                <div className="w-full animate-fade-in">
                    {renderStepContent()}
                </div>
            </div>

            <div className="flex-shrink-0 mt-8 flex justify-between items-center max-w-4xl mx-auto w-full">
                <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold disabled:opacity-50">უკან</button>
                <div className="flex items-center gap-2">
                    {[0,1,2,3].map(i => <div key={i} className={`w-3 h-3 rounded-full transition-colors ${step === i ? 'bg-brand-color' : 'bg-gray-600'}`}></div>)}
                </div>
                {step < 3 
                    ? <button onClick={() => setStep(s => Math.min(3, s+1))} className="px-6 py-2 bg-brand-color text-black rounded-lg font-semibold">შემდეგი</button>
                    : <button onClick={handleFinish} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold">დასრულება</button>
                }
            </div>
        </div>
    );
};

export default QuarterlyReviewPage;