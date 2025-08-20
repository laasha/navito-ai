

import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { Program } from '../../types';

interface ProgramCheckinModalProps {
    program: Program;
    week: number;
}

const ProgramCheckinModal: React.FC<ProgramCheckinModalProps> = ({ program, week }) => {
    const { completeProgramCheckin } = useAppContext();
    const { closeModal } = useModal();
    const { addToast } = useToast();
    const [feedback, setFeedback] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!feedback.trim()) {
            addToast('გთხოვთ, დაწეროთ თქვენი შთაბეჭდილებები.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            await completeProgramCheckin(program.id, week, feedback);
            addToast('მადლობა შეფასებისთვის!', 'success');
            closeModal();
        } catch (error: any) {
            addToast(error.message || 'შენახვისას მოხდა შეცდომა', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2 brand-text">პროგრამის შეფასება: კვირა {week}</h2>
            <p className="text-sm text-gray-400 mb-4">როგორ ჩაიარა გასულმა კვირამ პროგრამის "{program.name}" ფარგლებში?</p>
            <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md h-32"
                placeholder="რა იყო მარტივი? რა იყო რთული? რა ისწავლეთ?"
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

export default ProgramCheckinModal;