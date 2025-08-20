
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../context/AppContext';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';

const IdeaCaptureModal: React.FC = () => {
    const { addOrUpdateLifeItem } = useAppContext();
    const { closeModal } = useModal();
    const { addToast } = useToast();
    const [ideaText, setIdeaText] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!ideaText.trim()) {
            addToast('გთხოვთ, შეიყვანოთ ტექსტი', 'error');
            return;
        }
        setIsSaving(true);
        
        const firstLine = ideaText.trim().split('\n')[0];
        const title = `იდეა: ${firstLine.substring(0, 40)}${firstLine.length > 40 ? '...' : ''}`;

        await addOrUpdateLifeItem({
            type: 'event', // Could be a new 'idea' type, but 'event' with a slug is simpler for now
            title,
            dateISO: dayjs().toISOString(),
            category: 'other', // Or a dedicated 'ideas' category if added
            mood: 0,
            payload: {
                slug: 'idea-capture',
                details: ideaText.trim(),
            }
        });

        addToast('იდეა შენახულია!', 'success');
        setIsSaving(false);
        closeModal();
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 accent-text">იდეის დაფიქსირება</h2>
            <p className="text-sm text-gray-400 mb-4">სწრაფად ჩაიწერე, სანამ დაგავიწყდა. მოგვიანებით შეგიძლია დაამუშაო.</p>
            <textarea
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md h-40"
                placeholder="ჩემი გენიალური იდეა..."
                autoFocus
            />
            <div className="mt-6 flex justify-end space-x-3">
                <button onClick={closeModal} className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm">გაუქმება</button>
                <button onClick={handleSave} disabled={isSaving} className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm flex items-center disabled:opacity-50">
                    {isSaving && <span className="loader mr-2"></span>}
                    შენახვა
                </button>
            </div>
        </div>
    );
};

export default IdeaCaptureModal;
