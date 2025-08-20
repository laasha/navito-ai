
import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { generateThematicReview } from '../../services/geminiService';
import { ThematicReview } from '../../types';
import { useToast } from '../../context/ToastContext';

const LifeCompassWidget: React.FC = () => {
    const { lifeItems, habits } = useAppContext();
    const { addToast } = useToast();
    const [review, setReview] = useState<ThematicReview | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getReview = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await generateThematicReview(lifeItems, habits);
            setReview(result);
        } catch (error: any) {
            console.error("Failed to get Life Compass review:", error);
            // Don't show toast for this as it can be noisy
        } finally {
            setIsLoading(false);
        }
    }, [lifeItems, habits]);

    useEffect(() => {
        const lastReviewDate = localStorage.getItem('lifeCompassLastReview');
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        if (!lastReviewDate || new Date(lastReviewDate) < oneWeekAgo) {
            getReview().then(() => {
                 localStorage.setItem('lifeCompassLastReview', new Date().toISOString());
            });
        } else {
            setIsLoading(false); // No need to fetch
        }
    }, [getReview]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center text-sm text-gray-400">
                    <span className="loader mr-2"></span>
                    <span>კომპასი რეგულირდება...</span>
                </div>
            );
        }
        
        if (!review) {
             return <p className="text-sm text-gray-500">გასული კვირის ანალიზისთვის საკმარისი მონაცემები არ არის. განაგრძეთ Navito-ს გამოყენება.</p>;
        }

        return (
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-accent-color">{review.theme}</p>
                <p className="text-sm text-gray-300 my-2">{review.narrative}</p>
                <p className="text-sm font-semibold text-brand-color italic">"{review.prompt}"</p>
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-lg font-semibold accent-text">ცხოვრების კომპასი 🧭</h3>
                 <button onClick={getReview} disabled={isLoading} className="text-xs text-gray-400 hover:text-white disabled:opacity-50" title="განახლება">
                    <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 18"></path></svg>
                 </button>
            </div>
            <div className="bg-black/20 p-3 rounded-lg min-h-[100px]">
                {renderContent()}
            </div>
        </div>
    );
};

export default LifeCompassWidget;
