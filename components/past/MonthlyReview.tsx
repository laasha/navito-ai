
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { generateMonthlyReview } from '../../services/geminiService';
import { useToast } from '../../context/ToastContext';

const MonthlyReview: React.FC = () => {
    const [monthInput, setMonthInput] = useState(dayjs().format('YYYY-MM'));
    const [isLoading, setIsLoading] = useState(false);
    const [reviewOutput, setReviewOutput] = useState('<p class="text-gray-500">თქვენი ანალიზი აქ გამოჩნდება...</p>');
    const { lifeItems, habits } = useAppContext();
    const { addToast } = useToast();

    const handleGenerate = async () => {
        setIsLoading(true);

        const startOfMonth = dayjs(monthInput).startOf('month');
        const endOfMonth = dayjs(monthInput).endOf('month');

        const monthItems = lifeItems.filter(item => 
            dayjs(item.dateISO).isAfter(startOfMonth) && dayjs(item.dateISO).isBefore(endOfMonth)
        );

        const monthHabits = habits.map(habit => {
            const completedCount = habit.log.filter(date => 
                dayjs(date).isAfter(startOfMonth) && dayjs(date).isBefore(endOfMonth)
            ).length;
            return { name: habit.name, count: completedCount };
        }).filter(h => h.count > 0);

        if (monthItems.length === 0 && monthHabits.length === 0) {
            setReviewOutput('<p class="text-gray-400">არჩეულ თვეში მონაცემები არ მოიძებნა.</p>');
            setIsLoading(false);
            return;
        }

        try {
            const aiReview = await generateMonthlyReview(monthItems, monthHabits, startOfMonth);
            setReviewOutput(aiReview.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'));
        } catch (error: any) {
            addToast(error.message, 'error');
            setReviewOutput(`<p class="text-red-500">${error.message}</p>`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">თვის მიმოხილვის გენერატორი</h3>
            <p className="text-sm text-gray-400 mb-4">აირჩიეთ თვე და წელი, რათა AI-მ შექმნას თქვენი აქტივობების შემაჯამებელი ანალიზი.</p>
            <div className="flex items-center space-x-4">
                <input 
                    type="month" 
                    value={monthInput}
                    onChange={(e) => setMonthInput(e.target.value)}
                    className="p-2 bg-black/30 border-white/10 rounded-md" 
                />
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="p-2 bg-brand-color text-black rounded-lg text-sm font-semibold flex items-center disabled:opacity-50"
                >
                    <span>{isLoading ? 'ანალიზი მიმდინარეობს...' : 'ანალიზის გენერაცია'}</span>
                    {isLoading && <span className="loader ml-2"></span>}
                </button>
            </div>
            <div 
                className="mt-6 p-4 bg-black/20 rounded-lg min-h-[100px] prose prose-invert"
                dangerouslySetInnerHTML={{ __html: reviewOutput }}
            >
            </div>
        </div>
    );
};

export default MonthlyReview;