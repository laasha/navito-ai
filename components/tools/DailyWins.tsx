import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAppContext } from '../../context/AppContext';
import dayjs from 'dayjs';

const DailyWins: React.FC = () => {
    const { addToast } = useToast();
    const { addOrUpdateLifeItem } = useAppContext();
    const [wins, setWins] = useState(['', '', '']);
    const [isSaving, setIsSaving] = useState(false);

    const handleWinChange = (index: number, value: string) => {
        const newWins = [...wins];
        newWins[index] = value;
        setWins(newWins);
    };

    const handleSave = async () => {
        const filledWins = wins.filter(w => w.trim() !== '');
        if (filledWins.length === 0) {
            addToast('გთხოვთ, ჩაწეროთ მინიმუმ ერთი გამარჯვება.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            const details = "• " + filledWins.join('\n• ');
            await addOrUpdateLifeItem({
                type: 'event',
                title: `დღის გამარჯვებები: ${dayjs().format('YYYY-MM-DD')}`,
                dateISO: dayjs().toISOString(),
                category: 'personal',
                mood: 2, // A small positive mood boost
                payload: {
                    slug: 'daily-wins',
                    details: details,
                },
            });
            addToast('ყოჩაღ! გამარჯვებები შენახულია.', 'success');
            setWins(['', '', '']);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">დღის 3 გამარჯვება</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">დააფიქსირეთ პატარა წარმატებები. ეს ამაღლებს მოტივაციას და თავდაჯერებულობას.</p>
            
            <div className="space-y-2 mb-3">
                <input type="text" value={wins[0]} onChange={e => handleWinChange(0, e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md" placeholder="1. " />
                <input type="text" value={wins[1]} onChange={e => handleWinChange(1, e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md" placeholder="2. " />
                <input type="text" value={wins[2]} onChange={e => handleWinChange(2, e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md" placeholder="3. " />
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isSaving ? <span className="loader mr-2"></span> : '🏆'}
                შენახვა
            </button>
        </div>
    );
};

export default DailyWins;
