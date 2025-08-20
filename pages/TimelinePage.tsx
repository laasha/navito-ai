


import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../context/AppContext';
import { LifeItem, LifeItemType, TimelinePattern, ProjectedMoodPoint, Annotation, Category } from '../types';
import InitialLoader from '../components/InitialLoader';
import LifeWaveCanvas from '../components/LifeWaveCanvas';
import { useModal } from '../context/ModalContext';
import { findTimelinePatterns, generateFutureMoodProjection } from '../services/geminiService';
import { useToast } from '../context/ToastContext';

const ZOOM_LEVELS = [
    { name: '24 საათი', durationDays: 1 },
    { name: '1 კვირა', durationDays: 7 },
    { name: '1 თვე', durationDays: 30 },
    { name: '1 წელი', durationDays: 365 },
    { name: 'მთელი ცხოვრება', durationDays: 365 * 80 }
];

const AnnotationModal: React.FC<{ date: dayjs.Dayjs, onSave: (text: string) => void }> = ({ date, onSave }) => {
    const { closeModal } = useModal();
    const [text, setText] = useState('');

    const handleSave = () => {
        if (text.trim()) {
            onSave(text.trim());
            closeModal();
        }
    };
    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">ანოტაციის დამატება ({date.format('DD MMM YYYY')})</h3>
            <textarea value={text} onChange={e => setText(e.target.value)} className="w-full p-2 bg-black/30 border-white/10 rounded-md h-24" autoFocus />
            <div className="mt-4 flex justify-end gap-2">
                <button onClick={closeModal} className="p-2 bg-gray-600 rounded">გაუქმება</button>
                <button onClick={handleSave} className="p-2 bg-green-600 rounded">შენახვა</button>
            </div>
        </div>
    );
};

const TimelinePage: React.FC = () => {
    const { isLoading, lifeItems, habits, storyFocusId, setStoryFocusId, userSettings, addOrUpdateAnnotation, annotations } = useAppContext();
    const { openModal } = useModal();
    const { addToast } = useToast();

    // Core state
    const [zoomLevel, setZoomLevel] = useState(2);
    const [centerDate, setCenterDate] = useState(dayjs());
    
    // Feature state
    const [visibleTypes, setVisibleTypes] = useState<Set<LifeItemType>>(new Set(['event', 'goal', 'exercise', 'financial']));
    const [showIntensity, setShowIntensity] = useState(false);
    const [showFinancial, setShowFinancial] = useState(false);
    const [aiPatterns, setAiPatterns] = useState<TimelinePattern[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [projectedMood, setProjectedMood] = useState<ProjectedMoodPoint[]>([]);
    const [comparisonDate, setComparisonDate] = useState<dayjs.Dayjs | null>(null);

    // Advanced Filter State
    const [filters, setFilters] = useState({
        categories: new Set<string>(),
        people: '',
        moodRange: { min: -5, max: 5 },
        keyword: '',
    });

    const displayedItems = useMemo(() => {
        return lifeItems.filter(item => {
            if (!item.dateISO || !visibleTypes.has(item.type)) return false;
            if (filters.categories.size > 0 && !filters.categories.has(item.category)) return false;
            if (filters.people && !(item.payload?.people || []).some(p => p.toLowerCase().includes(filters.people.toLowerCase()))) return false;
            if (item.mood < filters.moodRange.min || item.mood > filters.moodRange.max) return false;
            if (filters.keyword && !item.title.toLowerCase().includes(filters.keyword.toLowerCase()) && !(item.payload?.details || '').toLowerCase().includes(filters.keyword.toLowerCase())) return false;
            return true;
        });
    }, [lifeItems, visibleTypes, filters]);

    const handleAiAnalysis = async () => {
        setIsAiLoading(true);
        try {
            const patterns = await findTimelinePatterns(lifeItems, habits);
            setAiPatterns(patterns);
            addToast('AI ანალიზი დასრულდა!', 'success');
        } catch (e: any) { addToast(e.message, 'error'); } 
        finally { setIsAiLoading(false); }
    };
    
    const handleFutureProjection = async () => {
        setIsAiLoading(true);
        try {
            const futureItems = lifeItems.filter(i => dayjs(i.dateISO).isAfter(dayjs()));
            const moodPoints = await generateFutureMoodProjection(futureItems, lifeItems);
            setProjectedMood(moodPoints);
            addToast('მომავლის პროგნოზი გენერირებულია!', 'success');
        } catch (e: any) { addToast(e.message, 'error'); }
        finally { setIsAiLoading(false); }
    };
    
    const handleAddAnnotation = (date: dayjs.Dayjs) => {
        openModal(<AnnotationModal date={date} onSave={(text) => addOrUpdateAnnotation({ dateISO: date.toISOString(), text })} />);
    };
    
    const handleExport = () => {
        const url = `#/print/timeline?centerDate=${centerDate.toISOString()}&zoomLevel=${zoomLevel}`;
        window.open(url, '_blank');
    };

    const handleOpenFilters = () => {
        openModal(<AdvancedFilterModal currentFilters={filters} onApply={setFilters} categories={userSettings.categories} />);
    };

    const handleOpenComparison = () => {
        openModal(<PeriodComparisonModal onCompare={setComparisonDate} />);
    };
    
    if (isLoading) return <InitialLoader />;

    return (
        <div className="h-full flex flex-col">
            <header className="flex flex-wrap justify-between items-center gap-2 mb-4">
                <h1 className="text-3xl font-bold brand-text">Life-Line</h1>
                <div className="flex flex-wrap items-center gap-2">
                    <WaveformControls visibleTypes={visibleTypes} setVisibleTypes={setVisibleTypes} showFinancial={showFinancial} setShowFinancial={setShowFinancial} />
                    <button onClick={() => setShowIntensity(!showIntensity)} className={`px-3 py-1 text-sm rounded-md transition-colors ${showIntensity ? 'bg-accent-color text-white' : 'bg-white/5'}`}>⚡️</button>
                    <button onClick={handleOpenFilters} className="px-3 py-1 text-sm rounded-md bg-white/5">ფილტრები ⚙️</button>
                    <button onClick={handleAiAnalysis} disabled={isAiLoading} className="px-3 py-1 text-sm rounded-md bg-white/5">AI ანალიზი ✨</button>
                    <button onClick={handleFutureProjection} disabled={isAiLoading} className="px-3 py-1 text-sm rounded-md bg-white/5">მომავლის პროგნოზი 🔮</button>
                    <button onClick={handleOpenComparison} className="px-3 py-1 text-sm rounded-md bg-white/5">შედარება ⚖️</button>
                    <button onClick={handleExport} className="px-3 py-1 text-sm rounded-md bg-white/5">ექსპორტი 📄</button>
                </div>
            </header>
             <div className="flex flex-wrap items-center gap-4 mb-4">
                 <div className="flex items-center space-x-3">
                    <label htmlFor="zoom-slider" className="text-sm whitespace-nowrap">მასშტაბი:</label>
                    <input type="range" id="zoom-slider" min="0" max={ZOOM_LEVELS.length - 1} value={zoomLevel} onChange={(e) => setZoomLevel(parseInt(e.target.value))} className="w-24 md:w-32 accent-brand-color" />
                    <span className="text-sm w-28 text-left">{ZOOM_LEVELS[zoomLevel].name}</span>
                </div>
                <button onClick={() => setCenterDate(dayjs())} className="px-3 py-1 bg-accent-color/80 hover:bg-accent-color text-white rounded-lg text-sm">დღეს</button>
            </div>
            <div className="flex-grow p-1 relative">
                <LifeWaveCanvas
                    zoomLevel={zoomLevel}
                    setZoomLevel={setZoomLevel}
                    centerDate={centerDate}
                    setCenterDate={setCenterDate}
                    displayedItems={displayedItems}
                    storyFocusId={storyFocusId}
                    setStoryFocusId={setStoryFocusId}
                    showIntensity={showIntensity}
                    showFinancial={showFinancial}
                    allAnnotations={annotations}
                    onAddAnnotation={handleAddAnnotation}
                    aiPatterns={aiPatterns}
                    projectedMood={projectedMood}
                    comparisonDate={comparisonDate}
                />
            </div>
        </div>
    );
};

// --- Modals defined inside for simplicity ---

const AdvancedFilterModal: React.FC<{currentFilters: any, onApply: any, categories: Category[]}> = ({currentFilters, onApply, categories}) => {
    const { closeModal } = useModal();
    const [filters, setFilters] = useState(currentFilters);

    const handleCategoryToggle = (catId: string) => {
        const newCats = new Set(filters.categories);
        if (newCats.has(catId)) newCats.delete(catId);
        else newCats.add(catId);
        setFilters({...filters, categories: newCats});
    };
    
    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">გაფართოებული ფილტრები</h3>
            <div className="space-y-4">
                <div>
                    <label>კატეგორიები:</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {categories.map(c => <button key={c.id} onClick={()=>handleCategoryToggle(c.id)} className={`px-2 py-1 text-xs rounded ${filters.categories.has(c.id) ? 'bg-brand-color text-black' : 'bg-gray-600'}`}>{c.name}</button>)}
                    </div>
                </div>
                <div>
                    <label>პიროვნება:</label>
                    <input type="text" value={filters.people} onChange={e=>setFilters({...filters, people: e.target.value})} className="w-full p-2 bg-black/30 rounded mt-1"/>
                </div>
                 <div>
                    <label>საკვანძო სიტყვა:</label>
                    <input type="text" value={filters.keyword} onChange={e=>setFilters({...filters, keyword: e.target.value})} className="w-full p-2 bg-black/30 rounded mt-1"/>
                </div>
                <div>
                    <label>განწყობა ({filters.moodRange.min} - {filters.moodRange.max}):</label>
                    <input type="range" min="-5" max={filters.moodRange.max} value={filters.moodRange.min} onChange={e=>setFilters({...filters, moodRange: {...filters.moodRange, min: +e.target.value}})} className="w-full accent-brand-color"/>
                    <input type="range" min={filters.moodRange.min} max="5" value={filters.moodRange.max} onChange={e=>setFilters({...filters, moodRange: {...filters.moodRange, max: +e.target.value}})} className="w-full accent-accent-color"/>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
                <button onClick={closeModal} className="p-2 bg-gray-600 rounded">დახურვა</button>
                <button onClick={() => {onApply(filters); closeModal();}} className="p-2 bg-green-600 rounded">გამოყენება</button>
            </div>
        </div>
    )
};

const PeriodComparisonModal: React.FC<{onCompare: (date: dayjs.Dayjs) => void}> = ({onCompare}) => {
    const { closeModal } = useModal();
    const [date, setDate] = useState(dayjs().subtract(1, 'year').format('YYYY-MM-DD'));
    return(
        <div>
            <h3 className="text-xl font-semibold mb-4">პერიოდის შედარება</h3>
            <p className="text-sm text-gray-400 mb-2">აირჩიეთ თარიღი, რომლის გარშემოც გსურთ შედარების ტალღის ჩვენება. მასშტაბი იქნება იგივე, რაც მთავარ თაიმლაინზე.</p>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-black/30 rounded"/>
             <div className="mt-6 flex justify-end gap-2">
                <button onClick={closeModal} className="p-2 bg-gray-600 rounded">გაუქმება</button>
                <button onClick={() => {onCompare(dayjs(date)); closeModal();}} className="p-2 bg-green-600 rounded">შედარება</button>
            </div>
        </div>
    );
};

const WaveformControls: React.FC<{ visibleTypes: Set<LifeItemType>, setVisibleTypes: React.Dispatch<React.SetStateAction<Set<LifeItemType>>>, showFinancial: boolean, setShowFinancial: (show: boolean) => void }> = ({ visibleTypes, setVisibleTypes, showFinancial, setShowFinancial }) => {
    
    const handleToggle = (type: LifeItemType) => {
        setVisibleTypes(prev => {
            const newSet = new Set(prev);
            newSet.has(type) ? newSet.delete(type) : newSet.add(type);
            return newSet;
        });
    };

    return (
        <div className="flex items-center space-x-1 glass-effect p-1 rounded-lg">
            {[{ type: 'event', label: '📌' }, { type: 'goal', label: '🎯' }, { type: 'exercise', label: '🧘' }].map(({ type, label }) => (
                <button key={type} onClick={() => handleToggle(type as LifeItemType)} className={`px-3 py-1 text-lg rounded-md ${visibleTypes.has(type as LifeItemType) ? 'bg-brand-color text-black' : 'bg-transparent text-gray-300'}`}>{label}</button>
            ))}
            <button onClick={() => setShowFinancial(!showFinancial)} className={`px-3 py-1 text-lg rounded-md ${showFinancial ? 'bg-brand-color text-black' : 'bg-transparent text-gray-300'}`}>💰</button>
        </div>
    );
};


export default TimelinePage;