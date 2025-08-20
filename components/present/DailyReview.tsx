
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { generateDailyReview } from '../../services/geminiService';
import { useToast } from '../../context/ToastContext';

const DailyReview: React.FC = () => {
    const { lifeItems, habits } = useAppContext();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [review, setReview] = useState('');

    const handleGenerateReview = async () => {
        setIsLoading(true);
        setReview('');

        try {
            const today = dayjs();
            const todayString = today.format('YYYY-MM-DD');

            const todayItems = lifeItems.filter(item => dayjs(item.dateISO).isSame(today, 'day'));
            const completedHabits = habits.filter(h => h.log.includes(todayString)).map(h => h.name);
            const energyLog = todayItems.find(item => item.payload?.slug === 'energy-log');
            const dailyLog = todayItems.find(item => item.payload?.slug === 'daily-log');

            let summary = `დღის შეჯამება: ${today.format('D MMMM, YYYY')}\n`;

            if (dailyLog) {
                summary += `- დღის შეფასება: ${((dailyLog.mood || 0) / 2) + 3}/5\n`;
                if (dailyLog.payload.gratitude) summary += `- მადლიერება: ${dailyLog.payload.gratitude}\n`;
            }

            if (energyLog) {
                const { morning, afternoon, evening } = energyLog.payload;
                summary += `- ენერგიის დონე (დილით/შუადღეს/საღამოს): ${morning || 'N/A'}/${afternoon || 'N/A'}/${evening || 'N/A'}\n`;
            }

            if (completedHabits.length > 0) {
                summary += `- შესრულებული ჩვევები: ${completedHabits.join(', ')}\n`;
            }

            const otherEvents = todayItems.filter(item => !item.payload?.slug?.includes('-log'));
            if (otherEvents.length > 0) {
                summary += `- სხვა მოვლენები/მიზნები: ${otherEvents.map(e => e.title).join(', ')}\n`;
            }
            
            if (summary.split('\n').length <= 2) {
                 addToast('დღევანდელი დღის შესახებ მონაცემები არასაკმარისია.', 'info');
                 setIsLoading(false);
                 return;
            }

            const result = await generateDailyReview(summary);
            setReview(result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'));

        } catch (error: any) {
            addToast(error.message, 'error');
            setReview(`<p class="text-red-500">${error.message}</p>`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">დღის შეჯამება</h3>
            <p className="text-sm text-gray-400 mb-4">დააჭირეთ ღილაკს, რათა AI-მ გააანალიზოს თქვენი დღე და მოგცეთ პერსონალური შეფასება.</p>
            <button 
                onClick={handleGenerateReview} 
                disabled={isLoading}
                className="p-2 bg-accent-color text-white rounded-lg text-sm font-semibold flex items-center disabled:opacity-50"
            >
                <span>{isLoading ? 'მიმოხილვა მზადდება...' : 'დღის შეჯამება ✨'}</span>
                {isLoading && <span className="loader ml-2"></span>}
            </button>
            {review && (
                <div 
                    className="mt-6 p-4 bg-black/20 rounded-lg min-h-[100px] prose prose-invert"
                    dangerouslySetInnerHTML={{ __html: review }}
                ></div>
            )}
        </div>
    );
};

export default DailyReview;
