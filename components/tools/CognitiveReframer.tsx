import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { reframeNegativeThought } from '../../services/geminiService';

const CognitiveReframer: React.FC = () => {
    const { addToast } = useToast();
    const [thought, setThought] = useState('');
    const [reframes, setReframes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleReframe = async () => {
        if (!thought.trim()) {
            addToast('გთხოვთ, შეიყვანოთ ფიქრი.', 'error');
            return;
        }
        setIsLoading(true);
        setReframes([]);
        try {
            const result = await reframeNegativeThought(thought);
            setReframes(result.reframes);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">აზრის რეფრეიმინგი</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">შეცვალეთ ნეგატიური აზროვნების პატერნები. AI შემოგთავაზებთ ალტერნატიულ, უფრო ჯანსაღ პერსპექტივებს.</p>
            
            <textarea
                value={thought}
                onChange={e => setThought(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md h-20 mb-3"
                placeholder="ჩაწერეთ ნეგატიური ფიქრი..."
            />
            <button onClick={handleReframe} disabled={isLoading} className="w-full p-2 bg-accent-color text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isLoading ? <span className="loader mr-2"></span> : '✨'}
                გადააზრება
            </button>
            
            {reframes.length > 0 && (
                <div className="mt-4 space-y-2 animate-fade-in">
                    {reframes.map((reframe, index) => (
                        <div key={index} className="bg-black/20 p-2 rounded-lg text-sm italic text-gray-300">
                           "{reframe}"
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CognitiveReframer;
