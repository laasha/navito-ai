import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { generateIdeaCatalyst } from '../../services/geminiService';

const IdeaCatalyst: React.FC = () => {
    const { addToast } = useToast();
    const [topic, setTopic] = useState('');
    const [ideas, setIdeas] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            addToast('გთხოვთ, შეიყვანოთ თემა.', 'error');
            return;
        }
        setIsLoading(true);
        setIdeas([]);
        try {
            const result = await generateIdeaCatalyst(topic);
            setIdeas(result.ideas);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">იდეების კატალიზატორი</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">გაჭედილი ხართ? შეიყვანეთ თემა და მიიღეთ კრეატიული, არასტანდარტული იდეები.</p>
            
            <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md mb-3"
                placeholder="თემა, მაგ: პროდუქტიულობა, ბედნიერება..."
            />
            <button onClick={handleGenerate} disabled={isLoading} className="w-full p-2 bg-accent-color text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isLoading ? <span className="loader mr-2"></span> : '💡'}
                იდეების გენერაცია
            </button>
            
            {ideas.length > 0 && (
                <div className="mt-4 space-y-2 animate-fade-in">
                    {ideas.map((idea, index) => (
                        <div key={index} className="bg-black/20 p-2 rounded-lg text-sm text-gray-300">
                           <p>{idea}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IdeaCatalyst;
