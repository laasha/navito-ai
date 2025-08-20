import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { generateAutobiographyChapter } from '../../services/geminiService';
import { useToast } from '../../context/ToastContext';

const AutoBiographer: React.FC = () => {
    const { lifeItems, habits } = useAppContext();
    const { addToast } = useToast();
    
    const [dates, setDates] = useState({
        start: dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
        end: dayjs().format('YYYY-MM-DD'),
    });
    const [isLoading, setIsLoading] = useState(false);
    const [narrative, setNarrative] = useState('');

    const handleDateChange = (field: 'start' | 'end', value: string) => {
        setDates(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setNarrative('');
        
        try {
            const startDate = dayjs(dates.start);
            const endDate = dayjs(dates.end);

            if (startDate.isAfter(endDate)) {
                addToast('დაწყების თარიღი დასრულების თარიღზე გვიან არ უნდა იყოს.', 'error');
                setIsLoading(false);
                return;
            }

            const itemsInRange = lifeItems.filter(item => {
                const itemDate = dayjs(item.dateISO);
                return itemDate.isAfter(startDate.subtract(1, 'day')) && itemDate.isBefore(endDate.add(1, 'day'));
            });

            const habitsInRange = habits.map(habit => {
                const completedCount = habit.log.filter(date => {
                    const logDate = dayjs(date);
                    return logDate.isAfter(startDate.subtract(1, 'day')) && logDate.isBefore(endDate.add(1, 'day'));
                }).length;
                return { name: habit.name, count: completedCount };
            }).filter(h => h.count > 0);

            if (itemsInRange.length < 3 && habitsInRange.length === 0) {
                addToast('ანალიზისთვის არჩეულ პერიოდში საკმარისი მონაცემები არ არის.', 'info');
                setIsLoading(false);
                return;
            }

            const result = await generateAutobiographyChapter(itemsInRange, habitsInRange, startDate, endDate);
            setNarrative(result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'));
        } catch (error: any) {
            addToast(error.message, 'error');
            setNarrative(`<p class="text-red-500">${error.message}</p>`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">ავტობიოგრაფი 📖</h3>
            <p className="text-sm text-gray-400 mb-4">აირჩიეთ პერიოდი და მიეცით AI-ს საშუალება, თქვენი ჩანაწერებიდან ცხოვრების ერთი თავი შექმნას. ეს არის ძლიერი ხელსაწყო, რომელიც დაგანახებთ თქვენს გზას, ზრდას და მთავარ თემებს.</p>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div>
                    <label htmlFor="start-date" className="text-xs text-gray-400">საწყისი თარიღი</label>
                    <input 
                        type="date"
                        id="start-date"
                        value={dates.start}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                        className="p-2 bg-black/30 border-white/10 rounded-md block" 
                    />
                </div>
                <div>
                     <label htmlFor="end-date" className="text-xs text-gray-400">საბოლოო თარიღი</label>
                    <input 
                        type="date" 
                        id="end-date"
                        value={dates.end}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                        className="p-2 bg-black/30 border-white/10 rounded-md block" 
                    />
                </div>
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="self-end p-2 bg-accent-color text-white rounded-lg text-sm font-semibold flex items-center disabled:opacity-50"
                >
                    <span>{isLoading ? 'თავი იქმნება...' : 'ნარატივის გენერაცია'}</span>
                    {isLoading && <span className="loader ml-2"></span>}
                </button>
            </div>
            
            {(narrative || isLoading) && (
                <div 
                    className="mt-6 p-4 bg-black/20 rounded-lg min-h-[200px] prose prose-invert"
                    dangerouslySetInnerHTML={{ __html: narrative || '' }}
                >
                </div>
            )}
        </div>
    );
};

export default AutoBiographer;
