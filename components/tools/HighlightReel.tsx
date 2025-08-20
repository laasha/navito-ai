import React, { useState, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAppContext } from '../../context/AppContext';
import { generateHighlightReel } from '../../services/geminiService';
import { Highlight } from '../../types';
import dayjs from 'dayjs';

const HighlightReel: React.FC = () => {
    const { addToast } = useToast();
    const { lifeItems, habits } = useAppContext();
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setHighlights([]);
        try {
            const thirtyDaysAgo = dayjs().subtract(30, 'days');
            const recentItems = lifeItems.filter(i => dayjs(i.dateISO).isAfter(thirtyDaysAgo));
            const recentHabits = habits.map(h => ({
                name: h.name,
                count: h.log.filter(l => dayjs(l).isAfter(thirtyDaysAgo)).length
            }));
            const dataSummary = `Items: ${JSON.stringify(recentItems.map(i => ({ title: i.title, type: i.type, date: i.dateISO, mood: i.mood })))}. Habits: ${JSON.stringify(recentHabits)}`;

            const result = await generateHighlightReel(dataSummary);
            if (result.highlights.length === 0) {
                addToast('ბოლო 30 დღეში მნიშვნელოვანი მომენტები ვერ მოიძებნა.', 'info');
            }
            setHighlights(result.highlights);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [lifeItems, habits, addToast]);

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">თვის საუკეთესო მომენტები</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">მიიღეთ ბოლო 30 დღის პოზიტიური მომენტების შეჯამება, რათა გაიხსენოთ თქვენი მიღწევები.</p>

            <button onClick={handleGenerate} disabled={isLoading} className="w-full p-2 bg-accent-color text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isLoading ? <span className="loader mr-2"></span> : '🌟'}
                მომენტების გენერაცია
            </button>
            
            {highlights.length > 0 && (
                <div className="mt-4 space-y-2 animate-fade-in max-h-48 overflow-y-auto pr-2">
                    {highlights.map((h, index) => (
                        <div key={index} className="bg-black/20 p-2 rounded-lg text-sm">
                           <p className="font-semibold text-gray-200">{h.title} <span className="text-xs text-gray-500">({dayjs(h.date).format('MMM DD')})</span></p>
                           <p className="italic text-gray-400 text-xs">"{h.reason}"</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HighlightReel;
