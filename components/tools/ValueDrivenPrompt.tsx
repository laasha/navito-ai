import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAppContext } from '../../context/AppContext';
import { generateValueDrivenPrompt } from '../../services/geminiService';
import dayjs from 'dayjs';

const ValueDrivenPrompt: React.FC = () => {
    const { addToast } = useToast();
    const { userSettings, addOrUpdateLifeItem } = useAppContext();
    const [selectedValue, setSelectedValue] = useState(userSettings.values[0]?.value || '');
    const [prompt, setPrompt] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!selectedValue) {
            addToast('გთხოვთ, აირჩიოთ ღირებულება.', 'error');
            return;
        }
        setIsLoading(true);
        setPrompt('');
        setAnswer('');
        try {
            const result = await generateValueDrivenPrompt(selectedValue);
            setPrompt(result.prompt);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = async () => {
        if (!prompt || !answer.trim()) {
            addToast('შესანახად საჭიროა კითხვა და პასუხი.', 'error');
            return;
        }
        try {
            await addOrUpdateLifeItem({
                type: 'exercise',
                title: `რეფლექსია ღირებულებაზე: ${selectedValue}`,
                dateISO: dayjs().toISOString(),
                payload: {
                    slug: 'value-prompt',
                    details: `**კითხვა:** ${prompt}\n\n**პასუხი:** ${answer}`,
                    question: prompt,
                    answer: answer,
                    value: selectedValue
                }
            });
            addToast('რეფლექსია შენახულია!', 'success');
            setPrompt('');
            setAnswer('');
        } catch (error: any) {
            addToast('შენახვისას მოხდა შეცდომა.', 'error');
        }
    };

    if (userSettings.values.length === 0) {
        return (
             <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full text-center items-center justify-center">
                <h3 className="text-xl font-semibold brand-text mb-2">ღირებულებაზე დაფუძნებული კითხვა</h3>
                <p className="text-sm text-gray-400">ამ ხელსაწყოს გამოსაყენებლად, ჯერ განსაზღვრეთ თქვენი ღირებულებები "მომავლის" გვერდზე.</p>
            </div>
        )
    }

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">ღირებულებაზე დაფუძნებული კითხვა</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">აირჩიეთ ღირებულება და მიიღეთ პერსონალური შეკითხვა რეფლექსიისთვის.</p>
            
            <div className="flex gap-2 mb-3">
                <select
                    value={selectedValue}
                    onChange={e => setSelectedValue(e.target.value)}
                    className="w-full p-2 bg-black/30 border-white/10 rounded-md"
                >
                    {userSettings.values.map(v => <option key={v.id} value={v.value}>{v.value}</option>)}
                </select>
                <button onClick={handleGenerate} disabled={isLoading} className="p-2 bg-accent-color text-white rounded-lg flex-shrink-0">
                     {isLoading ? <span className="loader !w-5 !h-5"></span> : '🤔'}
                </button>
            </div>
            
            {prompt && (
                <div className="animate-fade-in">
                    <p className="italic text-gray-300 mb-2">"{prompt}"</p>
                    <textarea
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        className="w-full p-2 bg-black/30 border-white/10 rounded-md h-24"
                        placeholder="თქვენი პასუხი..."
                    />
                    <button onClick={handleSave} className="w-full mt-2 p-2 bg-green-600 text-white rounded-lg text-sm">
                        რეფლექსიის შენახვა
                    </button>
                </div>
            )}
        </div>
    );
};

export default ValueDrivenPrompt;
