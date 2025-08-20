import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAppContext } from '../../context/AppContext';
import dayjs from 'dayjs';

const RetrospectivePlanner: React.FC = () => {
    const { addToast } = useToast();
    const { addOrUpdateLifeItem } = useAppContext();
    const [period, setPeriod] = useState('');
    const [wentWell, setWentWell] = useState('');
    const [couldImprove, setCouldImprove] = useState('');
    const [commitTo, setCommitTo] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!period.trim() || !wentWell.trim()) {
            addToast('გთხოვთ, შეავსოთ პერიოდი და მინიმუმ ერთი ველი.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            const details = `**რა გამოვიდა კარგად:**\n${wentWell}\n\n**რა შეიძლება გაუმჯობესდეს:**\n${couldImprove}\n\n**რაზე ვიღებ პასუხისმგებლობას:**\n${commitTo}`;
            await addOrUpdateLifeItem({
                type: 'exercise',
                title: `რეტროსპექტივა: ${period}`,
                dateISO: dayjs().toISOString(),
                category: 'learning',
                payload: {
                    slug: 'retrospective',
                    details,
                },
            });
            addToast('რეტროსპექტივა შენახულია.', 'success');
            setPeriod('');
            setWentWell('');
            setCouldImprove('');
            setCommitTo('');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">რეტროსპექტივა</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">შეაფასეთ განვლილი პერიოდი (პროექტი, კვირა) სტრუქტურირებული კითხვებით.</p>
            
            <div className="space-y-3 mb-3">
                <input type="text" value={period} onChange={e => setPeriod(e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md" placeholder="პერიოდი (მაგ: გასული კვირა, პროექტი X)" />
                <textarea value={wentWell} onChange={e => setWentWell(e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-16" placeholder="რა გამოვიდა კარგად?" />
                <textarea value={couldImprove} onChange={e => setCouldImprove(e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-16" placeholder="რა შეიძლება გაუმჯობესდეს?" />
                <textarea value={commitTo} onChange={e => setCommitTo(e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-16" placeholder="რაზე ვიღებ პასუხისმგებლობას?" />
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isSaving ? <span className="loader mr-2"></span> : '💾'}
                შენახვა
            </button>
        </div>
    );
};

export default RetrospectivePlanner;
