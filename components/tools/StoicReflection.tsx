import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { generateStoicReflection } from '../../services/geminiService';

const StoicReflection: React.FC = () => {
    const { addToast } = useToast();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const getPrompt = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await generateStoicReflection();
            setPrompt(result.prompt);
        } catch (error: any) {
            addToast(error.message, 'error');
            setPrompt("კითხვის გენერაციისას მოხდა შეცდომა.");
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);
    
    useEffect(() => {
        getPrompt();
    }, [getPrompt]);


    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full justify-between">
            <div>
                <h3 className="text-xl font-semibold brand-text mb-2">სტოიკური რეფლექსია</h3>
                <p className="text-sm text-gray-400 mb-4">დღის შეკითხვა შინაგანი სიმშვიდისა და სიბრძნისთვის.</p>
            </div>
            
            <div className="flex-grow flex items-center justify-center text-center">
                 {isLoading ? (
                    <span className="loader"></span>
                 ) : (
                    <p className="text-lg italic text-gray-200 animate-fade-in">"{prompt}"</p>
                 )}
            </div>
            
            <button onClick={getPrompt} disabled={isLoading} className="w-full mt-4 p-2 bg-accent-color/30 text-accent-color hover:bg-accent-color/50 rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                სხვა კითხვა
            </button>
        </div>
    );
};

export default StoicReflection;
