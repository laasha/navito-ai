
import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { LifeItem } from '../types';
import { generateStorySummary } from '../services/geminiService';
import StoryTimelineItem from '../components/story/StoryTimelineItem';
import { useToast } from '../context/ToastContext';

const StoryDetailPage: React.FC = () => {
    const { storyId } = useParams<{ storyId: string }>();
    const { getLifeItemById, getStoryItems, setStoryFocusId } = useAppContext();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState('');

    const startItem = useMemo(() => storyId ? getLifeItemById(storyId) : undefined, [storyId, getLifeItemById]);
    const storyItems = useMemo(() => storyId ? getStoryItems(storyId) : [], [storyId, getStoryItems]);

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        setSummary('');
        try {
            const result = await generateStorySummary(storyItems);
            setSummary(result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'));
        } catch (error: any) {
            addToast(error.message, 'error');
            setSummary(`<p class="text-red-500">${error.message}</p>`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleShowOnTimeline = () => {
        if (storyId) {
            setStoryFocusId(storyId);
            navigate('/timeline');
        }
    };

    if (!startItem) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500">ისტორია ვერ მოიძებნა.</p>
                <Link to="/stories" className="mt-4 inline-block p-2 bg-brand-color text-black rounded-lg text-sm font-semibold">
                    უკან ისტორიების სიაში
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Link to="/stories" className="text-sm brand-text hover:underline">&larr; უკან ისტორიების სიაში</Link>
            
            <div className="flex flex-wrap gap-4 items-center">
                 <h2 className="text-3xl font-bold accent-text">{startItem.title}</h2>
                 <button
                    onClick={handleShowOnTimeline}
                    className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold flex items-center"
                    title="ფოკუსირება Life-Line-ზე"
                >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" /></svg>
                    Life-Line-ზე ჩვენება
                </button>
            </div>
            
            <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">AI ბიოგრაფი</h3>
                 <button 
                    onClick={handleGenerateSummary} 
                    disabled={isLoading}
                    className="p-2 bg-brand-color text-black rounded-lg text-sm font-semibold flex items-center disabled:opacity-50"
                >
                    <span>{isLoading ? 'ანალიზი მიმდინარეობს...' : 'AI შეჯამების გენერაცია ✨'}</span>
                    {isLoading && <span className="loader ml-2"></span>}
                </button>
                {summary && (
                    <div 
                        className="mt-6 p-4 bg-black/20 rounded-lg min-h-[100px] prose prose-invert"
                        dangerouslySetInnerHTML={{ __html: summary }}
                    ></div>
                )}
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-6">ისტორიის თაიმლაინი</h3>
                <div className="relative border-l-2 border-[var(--brand-color)]/20 pl-8 space-y-8">
                    {storyItems.map((item, index) => (
                        <StoryTimelineItem key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StoryDetailPage;