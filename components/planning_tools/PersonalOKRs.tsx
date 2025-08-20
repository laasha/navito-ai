import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAppContext } from '../../context/AppContext';
import dayjs from 'dayjs';

const PersonalOKRs: React.FC = () => {
    const { addToast } = useToast();
    const { addOrUpdateLifeItem } = useAppContext();
    const [objective, setObjective] = useState('');
    const [keyResults, setKeyResults] = useState(['', '', '']);
    const [isSaving, setIsSaving] = useState(false);

    const handleKrChange = (index: number, value: string) => {
        const newKrs = [...keyResults];
        newKrs[index] = value;
        setKeyResults(newKrs);
    };

    const handleSave = async () => {
        const filledKrs = keyResults.filter(kr => kr.trim() !== '');
        if (!objective.trim() || filledKrs.length === 0) {
            addToast('გთხოვთ, შეავსოთ მიზანი და მინიმუმ ერთი საკვანძო შედეგი.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            const subtasks = filledKrs.map(kr => ({ text: kr, completed: false }));
            await addOrUpdateLifeItem({
                type: 'goal',
                title: `OKR: ${objective}`,
                dateISO: dayjs().add(3, 'month').toISOString(), // Quarterly goal
                category: 'impact',
                subtasks: subtasks,
                payload: {
                    slug: 'personal-okr',
                    details: `მთავარი მიზანი (Objective): ${objective}`
                },
            });
            addToast('OKR-მიზანი შენახულია!', 'success');
            setObjective('');
            setKeyResults(['', '', '']);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">პერსონალური OKR-ები</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">დასახეთ კვარტალური მიზნები და გაზომვადი შედეგები (Objectives & Key Results).</p>
            
            <div className="space-y-3 mb-3">
                <textarea value={objective} onChange={e => setObjective(e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-16" placeholder="მთავარი მიზანი (Objective)" />
                <input type="text" value={keyResults[0]} onChange={e => handleKrChange(0, e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md" placeholder="საკვანძო შედეგი 1" />
                <input type="text" value={keyResults[1]} onChange={e => handleKrChange(1, e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md" placeholder="საკვანძო შედეგი 2" />
                <input type="text" value={keyResults[2]} onChange={e => handleKrChange(2, e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md" placeholder="საკვანძო შედეგი 3" />
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isSaving ? <span className="loader mr-2"></span> : '🎯'}
                შენახვა
            </button>
        </div>
    );
};

export default PersonalOKRs;
