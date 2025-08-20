import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAppContext } from '../../context/AppContext';
import dayjs from 'dayjs';

const DecisionModel101010: React.FC = () => {
    const { addToast } = useToast();
    const { addOrUpdateLifeItem } = useAppContext();
    const [decision, setDecision] = useState('');
    const [tenMin, setTenMin] = useState('');
    const [tenMonth, setTenMonth] = useState('');
    const [tenYear, setTenYear] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!decision.trim() || !tenMin.trim()) {
            addToast('გთხოვთ, შეავსოთ გადაწყვეტილების და მინიმუმ 10 წუთის ველი.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            const details = `**10 წუთის პერსპექტივა:**\n${tenMin}\n\n**10 თვის პერსპექტივა:**\n${tenMonth}\n\n**10 წლის პერსპექტივა:**\n${tenYear}`;
            await addOrUpdateLifeItem({
                type: 'exercise',
                title: `10/10/10 ანალიზი: ${decision}`,
                dateISO: dayjs().toISOString(),
                category: 'personal',
                payload: {
                    slug: 'decision-10-10-10',
                    details,
                },
            });
            addToast('ანალიზი შენახულია.', 'success');
            setDecision('');
            setTenMin('');
            setTenMonth('');
            setTenYear('');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">10/10/10 მოდელი</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">გააანალიზეთ გადაწყვეტილება 10 წუთის, 10 თვის და 10 წლის პერსპექტივიდან.</p>
            
            <div className="space-y-3 mb-3">
                <input type="text" value={decision} onChange={e => setDecision(e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md" placeholder="გადაწყვეტილება" />
                <textarea value={tenMin} onChange={e => setTenMin(e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-16" placeholder="შედეგები 10 წუთში..." />
                <textarea value={tenMonth} onChange={e => setTenMonth(e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-16" placeholder="შედეგები 10 თვეში..." />
                <textarea value={tenYear} onChange={e => setTenYear(e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-16" placeholder="შედეგები 10 წელიწადში..." />
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isSaving ? <span className="loader mr-2"></span> : '💾'}
                შენახვა
            </button>
        </div>
    );
};

export default DecisionModel101010;
