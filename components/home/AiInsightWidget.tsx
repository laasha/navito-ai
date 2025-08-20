
import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { generateProactiveInsight } from '../../services/geminiService';
import { ProactiveInsight } from '../../types';
import { useToast } from '../../context/ToastContext';
import dayjs from 'dayjs';

const AiInsightWidget: React.FC = () => {
    const { lifeItems, habits, addOrUpdateLifeItem } = useAppContext();
    const { addToast } = useToast();
    const [insight, setInsight] = useState<ProactiveInsight | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getInsight = useCallback(async () => {
        if (lifeItems.length < 3 && habits.length === 0) {
            setIsLoading(false);
            setInsight(null);
            return;
        }
        setIsLoading(true);
        try {
            const result = await generateProactiveInsight(lifeItems, habits);
            setInsight(result);
        } catch (error: any) {
            console.error("Failed to get AI insight:", error);
            addToast(error.message, 'error');
            setInsight({ type: 'general', text: 'რჩევის მიღებისას შეცდომა მოხდა.' });
        } finally {
            setIsLoading(false);
        }
    }, [lifeItems, habits, addToast]);
    
    useEffect(() => {
        getInsight();
    }, [getInsight]);
    
    const handleStartExperiment = async () => {
        if (!insight || !insight.action) return;
        
        const { habitName, durationDays } = insight.action;
        
        await addOrUpdateLifeItem({
            type: 'goal',
            title: `ექსპერიმენტი: ${habitName} (${durationDays} დღე)`,
            dateISO: dayjs().add(durationDays, 'day').toISOString(), // Deadline
            category: 'personal',
            payload: {
                details: `AI-ს მიერ შემოთავაზებული ექსპერიმენტი: შევასრულო '${habitName}' ჩვევა ${durationDays} დღის განმავლობაში და დავაკვირდე შედეგს.`
            }
        });
        
        addToast(`ექსპერიმენტი დაწყებულია! ახალი მიზანი დაგემატათ.`, 'success');
        
        setInsight(prev => prev ? ({ ...prev, action: undefined }) : null);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center text-sm text-gray-400">
                    <span className="loader mr-2"></span>
                    <span>ანალიზი მიმდინარეობს...</span>
                </div>
            );
        }
        
        if (!insight) {
             return <p className="text-sm text-gray-500">დაამატეთ მეტი მონაცემი (მოვლენები, ჩვევები) პერსონალური რჩევების მისაღებად.</p>;
        }

        if (insight.action) {
            return (
                <div>
                    <p className="text-sm text-gray-300 mb-3">{insight.text}</p>
                    <button 
                        onClick={handleStartExperiment}
                        className="p-2 bg-accent-color text-white rounded-lg text-sm w-full font-semibold hover:bg-fuchsia-500"
                    >
                        ვცადოთ {insight.action.durationDays}-დღიანი ექსპერიმენტი!
                    </button>
                </div>
            );
        }
        
        return <p className="text-sm text-gray-300">{insight.text}</p>;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-lg font-semibold accent-text">დღის რჩევა ✨</h3>
                 <button onClick={getInsight} disabled={isLoading} className="text-xs text-gray-400 hover:text-white disabled:opacity-50" title="განახლება">
                    <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 18"></path></svg>
                 </button>
            </div>
            <div className="bg-black/20 p-3 rounded-lg min-h-[50px]">
                {renderContent()}
            </div>
        </div>
    );
};

export default AiInsightWidget;