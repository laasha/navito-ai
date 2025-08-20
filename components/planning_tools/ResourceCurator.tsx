import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { curateResources } from '../../services/geminiService';
import { ResourceCuratorResponse } from '../../types';

const ResourceCurator: React.FC = () => {
    const { addToast } = useToast();
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ResourceCuratorResponse | null>(null);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            addToast('გთხოვთ, ჩაწეროთ თემა.', 'error');
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const response = await curateResources(topic);
            setResult(response);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">რესურსების კურატორი</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">მიუთითეთ მიზანი ან თემა და მიიღეთ სასწავლო და პრაქტიკული რესურსების სია (სტატიები, ვიდეოები, ხელსაწყოები).</p>
            
            <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md mb-3"
                placeholder="მაგ: React-ის სწავლა, ფინანსური დამოუკიდებლობა..."
            />
            <button onClick={handleGenerate} disabled={isLoading} className="w-full p-2 bg-accent-color text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isLoading ? <span className="loader mr-2"></span> : '📚'}
                რესურსების მოძიება
            </button>
            
            {result && (
                <div className="mt-4 space-y-3 animate-fade-in max-h-60 overflow-y-auto pr-2">
                    {result.resources.map((res, index) => (
                        <div key={index} className="bg-black/20 p-3 rounded-lg">
                           <p className="font-bold text-brand-color">[{res.type}] {res.title}</p>
                           <p className="text-sm text-gray-300">{res.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResourceCurator;
