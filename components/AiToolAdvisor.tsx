
import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { suggestTools } from '../services/geminiService';
import { ToolSuggestion } from '../types';

const AiToolAdvisor: React.FC = () => {
    const { lifeItems, habits } = useAppContext();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [suggestions, setSuggestions] = useState<ToolSuggestion[]>([]);

    const getSuggestions = useCallback(async () => {
        setIsLoading(true);
        try {
            const sevenDaysAgo = dayjs().subtract(7, 'days');
            const recentItems = lifeItems.filter(i => dayjs(i.dateISO).isAfter(sevenDaysAgo));
            if (recentItems.length < 1) {
                setSuggestions([]);
                setIsLoading(false);
                return;
            }
            
            let dataSummary = `Recent Items: ${recentItems.map(i => `- ${i.title} (Type: ${i.type}, Mood: ${i.mood})`).join('\n')}\n`;
            dataSummary += `Recent Habits: ${habits.map(h => `- ${h.name}: ${h.log.filter(l => dayjs(l).isAfter(sevenDaysAgo)).length} times`).join('\n')}`;

            const result = await suggestTools(dataSummary);
            setSuggestions(result.suggestions);

        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [lifeItems, habits, addToast]);
    
    useEffect(() => {
        getSuggestions();
    }, [getSuggestions]);
    
    const handleSuggestionClick = (slug: string) => {
        const element = document.getElementById(`tool-${slug}`);
        if (element) {
            const section = element.closest('.glass-effect.rounded-xl.overflow-hidden');
            if (section) {
                const button = section.querySelector('button');
                if (!element.offsetParent) {
                    button?.click();
                }
            }
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('animate-pulse-once');
                setTimeout(() => element.classList.remove('animate-pulse-once'), 2000);
            }, 300);
        } else {
            addToast('ხელსაწყო ვერ მოიძებნა.', 'error');
        }
    };
    
    if (isLoading) {
        return (
            <div className="glass-effect rounded-xl p-4 text-center">
                <p className="text-sm text-gray-400 animate-pulse">AI ეძებს თქვენთვის საუკეთესო ხელსაწყოებს...</p>
            </div>
        );
    }
    
    if (suggestions.length === 0) {
        return null; // Don't show if no suggestions
    }

    return (
        <div className="bg-gradient-to-r from-brand-color/20 to-accent-color/20 p-6 rounded-xl border border-white/10 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">AI მრჩეველი ✨</h3>
                <button onClick={getSuggestions} disabled={isLoading} className="text-xs text-gray-300 hover:text-white disabled:opacity-50" title="განახლება">
                   <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 18"></path></svg>
                </button>
            </div>
            <p className="text-sm text-gray-300 mb-4">თქვენი ბოლო აქტივობიდან გამომდინარე, გირჩევთ, სცადოთ ეს ხელსაწყოები:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map(s => (
                    <button 
                        key={s.slug}
                        onClick={() => handleSuggestionClick(s.slug)}
                        className="bg-black/30 p-4 rounded-lg text-left hover:bg-black/50 transition-colors"
                    >
                        <p className="font-bold text-brand-color">{s.name}</p>
                        <p className="text-xs text-gray-400 mt-1 italic">"{s.reasoning}"</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AiToolAdvisor;
