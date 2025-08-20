import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAppContext } from '../../context/AppContext';
import dayjs from 'dayjs';

const DecisionJournal: React.FC = () => {
    const { addToast } = useToast();
    const { addOrUpdateLifeItem } = useAppContext();
    const [decision, setDecision] = useState('');
    const [context, setContext] = useState('');
    const [outcome, setOutcome] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!decision.trim() || !context.trim() || !outcome.trim()) {
            addToast('გთხოვთ, შეავსოთ ყველა ველი.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            const details = `**კონტექსტი/არგუმენტები:**\n${context}\n\n**მოსალოდნელი შედეგი:**\n${outcome}`;
            await addOrUpdateLifeItem({
                type: 'exercise',
                title: `გადაწყვეტილება: ${decision}`,
                dateISO: dayjs().toISOString(),
                category: 'personal',
                payload: {
                    slug: 'decision-journal',
                    details: details,
                    decision,
                    context,
                    outcome
                },
            });
            addToast('გადაწყვეტილება შენახულია.', 'success');
            setDecision('');
            setContext('');
            setOutcome('');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">გადაწყვეტილების ჟურნალი</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">დააფიქსირეთ მნიშვნელოვანი გადაწყვეტილებები, რათა მომავალში გააანალიზოთ შედეგები.</p>
            
            <div className="space-y-3 mb-3">
                <input type="text" value={decision} onChange={e => setDecision(e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md" placeholder="გადაწყვეტილება" />
                <textarea value={context} onChange={e => setContext(e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-20" placeholder="კონტექსტი და არგუმენტები..." />
                <textarea value={outcome} onChange={e => setOutcome(e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-16" placeholder="მოსალოდნელი შედეგი..." />
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isSaving ? <span className="loader mr-2"></span> : '⚖️'}
                შენახვა
            </button>
        </div>
    );
};

export default DecisionJournal;
