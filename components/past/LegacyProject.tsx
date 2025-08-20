
import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { generateLegacyPrompt } from '../../services/geminiService';
import dayjs from 'dayjs';

const LegacyProject: React.FC = () => {
    const { legacyEntries, addLegacyEntry } = useAppContext();
    const { addToast } = useToast();
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const getNewQuestion = useCallback(async () => {
        setIsLoading(true);
        try {
            const previousAnswers = legacyEntries.map(e => `Q: ${e.question}\nA: ${e.answer}`);
            const newQuestion = await generateLegacyPrompt(previousAnswers);
            setQuestion(newQuestion);
        } catch (error: any) {
            addToast(error.message, 'error');
            setQuestion("კითხვის გენერაციისას მოხდა შეცდომა. სცადეთ მოგვიანებით.");
        } finally {
            setIsLoading(false);
        }
    }, [legacyEntries, addToast]);

    useEffect(() => {
        const lastEntryDate = legacyEntries.length > 0 ? dayjs(legacyEntries[legacyEntries.length - 1].dateISO) : null;
        // Generate a new question if there are no entries or if the last entry was more than a week ago.
        if (!lastEntryDate || dayjs().diff(lastEntryDate, 'day') > 7) {
            getNewQuestion();
        } else {
            setQuestion(legacyEntries[legacyEntries.length - 1].question);
            setAnswer(legacyEntries[legacyEntries.length - 1].answer);
        }
    }, [getNewQuestion, legacyEntries]);

    const handleSave = async () => {
        if (!answer.trim()) {
            addToast('გთხოვთ, ჩაწეროთ პასუხი.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            await addLegacyEntry({ question, answer });
            addToast('თქვენი პასუხი მემკვიდრეობას შეემატა!', 'success');
        } catch (error: any) {
             addToast('შენახვისას მოხდა შეცდომა.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const lastEntryIsAnswered = legacyEntries.some(e => e.question === question && e.answer);

    return (
        <div className="glass-effect rounded-xl p-6 h-full flex flex-col">
            <h3 className="text-xl font-semibold mb-2">პროექტი "მემკვიდრეობა"</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">AI პერიოდულად დაგისვამთ ღრმა კითხვას. თქვენი პასუხები თქვენს პირად ციფრულ მემუარებს შექმნის.</p>
            
            <div className="bg-black/20 p-4 rounded-lg">
                {isLoading ? (
                     <div className="flex items-center text-sm text-gray-400">
                        <span className="loader mr-2"></span>
                        <span>კითხვა მზადდება...</span>
                    </div>
                ) : (
                    <p className="font-semibold italic text-brand-color">"{question}"</p>
                )}
            </div>
            
            <textarea 
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                className="w-full p-2 mt-4 bg-black/30 border-white/10 rounded-md h-32"
                placeholder="თქვენი პასუხი..."
                disabled={isSaving || isLoading || lastEntryIsAnswered}
            />
            
            <div className="mt-4 flex items-center justify-between">
                 <button onClick={getNewQuestion} disabled={isLoading} className="text-xs text-gray-400 hover:text-white" title="ახალი კითხვის გენერაცია">
                    განახლება
                 </button>
                 <button onClick={handleSave} disabled={isSaving || !answer.trim() || lastEntryIsAnswered} className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold flex items-center disabled:opacity-50">
                     {isSaving && <span className="loader mr-2"></span>}
                     {lastEntryIsAnswered ? 'შენახულია' : 'შენახვა'}
                 </button>
            </div>
        </div>
    );
};

export default LegacyProject;