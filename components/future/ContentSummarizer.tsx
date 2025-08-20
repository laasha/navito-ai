
import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { summarizeContent } from '../../services/geminiService';
import { SummarizedContent } from '../../types';
import { useModal } from '../../context/ModalContext';
import LifeItemEditModal from '../LifeItemEditModal';
import { useAppContext } from '../../context/AppContext';

const ContentSummarizer: React.FC = () => {
    const { addToast } = useToast();
    const { openModal, closeModal } = useModal();
    const { addOrUpdateLifeItem } = useAppContext();
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SummarizedContent | null>(null);

    const handleSummarize = async () => {
        if (!content.trim()) {
            addToast('გთხოვთ, ჩასვათ ტექსტი.', 'error');
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const summary = await summarizeContent(content);
            setResult(summary);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCreateGoal = (task: string) => {
        openModal(
            <LifeItemEditModal initialData={{
                type: 'goal',
                title: task,
                payload: { details: `დაფუძნებულია კონტენტზე: "${result?.title || 'Unknown'}"` }
            }} />
        );
    };

    return (
        <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-2">AI კონსპექტორი</h3>
            <p className="text-sm text-gray-400 mb-4">ჩასვით ტექსტი და მიიღეთ შეჯამება და სამოქმედო ნაბიჯები.</p>
            
            <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md h-28"
                placeholder="ჩასვით სტატიის, წიგნის თავის ან სხვა ტექსტი აქ..."
            />
            <button onClick={handleSummarize} disabled={isLoading} className="w-full mt-3 p-2 bg-brand-color text-black rounded-lg font-semibold flex items-center justify-center disabled:opacity-50">
                 {isLoading && <span className="loader mr-2"></span>}
                 {isLoading ? 'ანალიზი...' : 'ტექსტის ანალიზი 📚'}
            </button>
            
            {result && (
                <div className="animate-fade-in mt-4 space-y-3">
                    <h4 className="font-bold text-lg brand-text">{result.title}</h4>
                    <p className="text-sm text-gray-300 border-l-2 border-accent-color pl-3">{result.summary}</p>
                    <div>
                        <h5 className="font-semibold">სამოქმედო ნაბიჯები:</h5>
                        <ul className="text-sm text-gray-300 space-y-1 mt-1">
                            {result.actionableTasks.map((task, i) => (
                                <li key={i} className="flex items-center justify-between p-1 rounded hover:bg-white/10">
                                    <span>- {task}</span>
                                    <button onClick={() => handleCreateGoal(task)} className="text-xs bg-accent-color text-white px-2 py-0.5 rounded-full" title="მიზნად დამატება">+</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentSummarizer;