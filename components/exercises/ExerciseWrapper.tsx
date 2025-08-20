
import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { getAIHintForExercise } from '../../services/geminiService';
import { LifeItem } from '../../types';

interface ExerciseWrapperProps {
    slug: string;
    title: string;
    description: string;
    children: React.ReactNode;
    initialData: LifeItem | null;
    gatherData: () => any;
    onSave: (data: any) => Promise<void>;
    onReset: () => void;
}

const ExerciseWrapper: React.FC<ExerciseWrapperProps> = ({ slug, title, description, children, gatherData, onSave, onReset }) => {
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<string | null>(null);
    const { addToast } = useToast();

    const handleSave = async () => {
        try {
            const data = gatherData();
            await onSave(data);
            addToast(`${title}: შედეგი შენახულია!`, 'success');
        } catch (error) {
            addToast('შენახვისას მოხდა შეცდომა', 'error');
            console.error(error);
        }
    };
    
    const handleReset = () => {
        onReset();
        setAiResult(null);
        addToast(`${title}: ფორმა გასუფთავდა`, 'info');
    };

    const handleAiHint = async () => {
        setIsAiLoading(true);
        setAiResult(null);
        try {
            const currentData = gatherData();
            const hint = await getAIHintForExercise(slug, currentData, null);
            setAiResult(hint.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'));
        } catch (error: any) {
            addToast(error.message, 'error');
            setAiResult(`<p class="text-red-400">${error.message}</p>`);
        } finally {
            setIsAiLoading(false);
        }
    };
    

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md">
            <div className="mb-4">
                <h3 className="text-xl font-semibold brand-text">{title}</h3>
                <p className="text-sm text-gray-400 mt-1">{description}</p>
            </div>
            <div className="exercise-ui-container mb-4 min-h-[100px]">
                {children}
            </div>
            {(isAiLoading || aiResult) && (
                 <div className="result-pane bg-black/20 p-3 rounded-lg min-h-[50px] max-h-48 overflow-y-auto mb-4">
                    {isAiLoading && <p className="text-xs text-yellow-400 animate-pulse">AI ფიქრობს...</p>}
                    {aiResult && (
                        <div>
                             <p className="text-sm font-semibold mb-1">AI რჩევა:</p>
                             <div className="text-xs prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: aiResult }}/>
                        </div>
                    )}
                </div>
            )}
            <div className="flex flex-wrap gap-3">
                <button onClick={handleSave} className="flex-1 p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm">შედეგის შენახვა 🔒</button>
                <button onClick={handleAiHint} disabled={isAiLoading} className="flex-1 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm disabled:opacity-50">AI რჩევა ✨</button>
                <button onClick={handleReset} className="flex-1 p-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm">გასუფთავება ♻️</button>
            </div>
        </div>
    );
};

export default ExerciseWrapper;