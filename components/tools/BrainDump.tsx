
import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAppContext } from '../../context/AppContext';
import dayjs from 'dayjs';

const BrainDump: React.FC = () => {
    const { addToast } = useToast();
    const { addOrUpdateLifeItem } = useAppContext();
    const [text, setText] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!text.trim()) {
            addToast('ველი ცარიელია.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            await addOrUpdateLifeItem({
                type: 'event',
                title: `გონების გათავისუფლება: ${dayjs().format('YYYY-MM-DD HH:mm')}`,
                dateISO: dayjs().toISOString(),
                category: 'personal',
                payload: {
                    slug: 'brain-dump',
                    details: text,
                },
            });
            addToast('ფიქრები შენახულია!', 'success');
            setText('');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">გონების გათავისუფლება</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">სწრაფად ჩამოწერეთ ყველა ფიქრი, იდეა და საქმე, რაც თავში გიტრიალებთ, რათა გაათავისუფლოთ მენტალური სივრცე.</p>
            
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md h-28 mb-3"
                placeholder="ყველაფერი, რაც თავში მოგდით..."
            />

            <button onClick={handleSave} disabled={isSaving} className="w-full p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isSaving ? <span className="loader mr-2"></span> : '🧠'}
                შენახვა და გასუფთავება
            </button>
        </div>
    );
};

export default BrainDump;
