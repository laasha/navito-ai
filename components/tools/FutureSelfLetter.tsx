import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAppContext } from '../../context/AppContext';
import dayjs from 'dayjs';

const FutureSelfLetter: React.FC = () => {
    const { addToast } = useToast();
    const { addOrUpdateLifeItem } = useAppContext();
    const [letter, setLetter] = useState('');
    const [deliveryDate, setDeliveryDate] = useState(dayjs().add(1, 'year').format('YYYY-MM-DD'));
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!letter.trim()) {
            addToast('გთხოვთ, დაწეროთ წერილი.', 'error');
            return;
        }
        if (dayjs(deliveryDate).isBefore(dayjs().add(1, 'day'))) {
            addToast('გთხოვთ, აირჩიოთ მომავალი თარიღი.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            await addOrUpdateLifeItem({
                type: 'event',
                title: `წერილი მომავლიდან`,
                dateISO: dayjs(deliveryDate).toISOString(),
                category: 'personal',
                payload: {
                    slug: 'future-self-letter',
                    details: letter,
                },
            });
            addToast(`წერილი დალუქულია! ის თქვენს თაიმლაინზე ${dayjs(deliveryDate).format('YYYY-MM-DD')}-ში გამოჩნდება.`, 'success');
            setLetter('');
            setDeliveryDate(dayjs().add(1, 'year').format('YYYY-MM-DD'));
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">წერილი მომავალ "მე"-ს</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">დაწერეთ რჩევა, დასვით კითხვა ან უბრალოდ აღწერეთ დღევანდელი დღე. ეს წერილი მომავალში გაგახსენებთ, ვინ იყავით.</p>
            
            <textarea
                value={letter}
                onChange={e => setLetter(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md h-28 mb-3"
                placeholder="ძვირფასო მომავლის მე..."
            />
            <div className="mb-3">
                <label className="text-xs text-gray-400">"მიწოდების" თარიღი:</label>
                <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md" />
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isSaving ? <span className="loader mr-2"></span> : '✉️'}
                დროის კაფსულაში მოთავსება
            </button>
        </div>
    );
};

export default FutureSelfLetter;
