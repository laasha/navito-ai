
import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { generateChapterSummary } from '../../services/geminiService';
import { LifeItem } from '../../types';

const StoryChapters: React.FC = () => {
    const { lifeItems, addOrUpdateLifeItem, removeLifeItem } = useAppContext();
    const { addToast } = useToast();

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [newChapter, setNewChapter] = useState({ title: '', startDate: '', endDate: '' });
    const [analysis, setAnalysis] = useState<{ [key: string]: string | null }>({});
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const chapters = useMemo(() => {
        return lifeItems
            .filter(item => item.payload?.slug === 'life-chapter')
            .sort((a, b) => dayjs(a.dateISO).valueOf() - dayjs(b.dateISO).valueOf());
    }, [lifeItems]);

    const handleAddChapter = async () => {
        if (!newChapter.title || !newChapter.startDate || !newChapter.endDate) {
            addToast('გთხოვთ, შეავსოთ ყველა ველი.', 'error');
            return;
        }
        await addOrUpdateLifeItem({
            type: 'event',
            title: newChapter.title,
            dateISO: dayjs(newChapter.startDate).toISOString(),
            payload: {
                slug: 'life-chapter',
                endDateISO: dayjs(newChapter.endDate).toISOString(),
            },
        });
        addToast('ცხოვრების თავი დაემატა!', 'success');
        setNewChapter({ title: '', startDate: '', endDate: '' });
        setIsFormVisible(false);
    };
    
    const handleRemoveChapter = async (itemId: string) => {
        if (window.confirm("დარწმუნებული ხართ, რომ გსურთ ამ თავის წაშლა?")) {
            await removeLifeItem(itemId);
            addToast('თავი წაიშალა.', 'info');
        }
    };

    const handleGenerateAnalysis = async (chapter: LifeItem) => {
        setIsLoading(chapter.id);
        setAnalysis(prev => ({ ...prev, [chapter.id]: null }));
        try {
            const chapterItems = lifeItems.filter(item => 
                dayjs(item.dateISO).isAfter(dayjs(chapter.dateISO)) && 
                dayjs(item.dateISO).isBefore(dayjs(chapter.payload.endDateISO as string))
            );

            if (chapterItems.length === 0) {
                setAnalysis(prev => ({ ...prev, [chapter.id]: '<p class="text-gray-400">ამ პერიოდში ჩანაწერები არ მოიძებნა.</p>' }));
                return;
            }

            const result = await generateChapterSummary(chapter.title, chapterItems);
            setAnalysis(prev => ({ ...prev, [chapter.id]: result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') }));
        } catch (error: any) {
            addToast(error.message, 'error');
            setAnalysis(prev => ({ ...prev, [chapter.id]: `<p class="text-red-500">${error.message}</p>` }));
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">ცხოვრების თავები</h3>
                <button 
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="p-2 bg-brand-color text-black rounded-lg text-sm font-semibold"
                >
                    {isFormVisible ? 'გაუქმება' : 'ახალი თავის დამატება'}
                </button>
            </div>

            {isFormVisible && (
                <div className="bg-black/20 p-4 rounded-lg mb-4 space-y-3">
                    <input type="text" placeholder="თავის სათაური" value={newChapter.title} onChange={e => setNewChapter({ ...newChapter, title: e.target.value })} className="w-full p-2 bg-black/30 border-white/10 rounded-md" />
                    <div className="flex gap-3">
                        <input type="date" title="Start Date" value={newChapter.startDate} onChange={e => setNewChapter({ ...newChapter, startDate: e.target.value })} className="w-full p-2 bg-black/30 border-white/10 rounded-md" />
                        <input type="date" title="End Date" value={newChapter.endDate} onChange={e => setNewChapter({ ...newChapter, endDate: e.target.value })} className="w-full p-2 bg-black/30 border-white/10 rounded-md" />
                    </div>
                    <button onClick={handleAddChapter} className="w-full p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm">დამატება</button>
                </div>
            )}

            <div className="space-y-4">
                {chapters.map(chapter => (
                    <div key={chapter.id} className="bg-black/20 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                           <div>
                                <h4 className="font-semibold text-lg brand-text">{chapter.title}</h4>
                                <p className="text-xs text-gray-400">
                                    {dayjs(chapter.dateISO).format('YYYY-MM-DD')} - {dayjs(chapter.payload.endDateISO as string).format('YYYY-MM-DD')}
                                </p>
                           </div>
                           <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleGenerateAnalysis(chapter)} 
                                    disabled={isLoading === chapter.id}
                                    className="p-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50 flex items-center"
                                >
                                    {isLoading === chapter.id ? <span className="loader mr-2"></span> : '✨'}
                                    <span>AI ანალიზი</span>
                                </button>
                                <button onClick={() => handleRemoveChapter(chapter.id)} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
                           </div>
                        </div>
                        {analysis[chapter.id] && (
                             <div 
                                className="mt-4 p-3 bg-black/30 rounded-lg min-h-[50px] prose prose-sm prose-invert"
                                dangerouslySetInnerHTML={{ __html: analysis[chapter.id]! }}
                            ></div>
                        )}
                    </div>
                ))}
                {chapters.length === 0 && !isFormVisible && (
                    <p className="text-gray-500 text-center py-4">დაამატეთ თქვენი ცხოვრების პირველი თავი.</p>
                )}
            </div>
        </div>
    );
};

export default StoryChapters;
