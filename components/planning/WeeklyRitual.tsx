
import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { generateWeeklyPlanningSuggestions } from '../../services/geminiService';

const WeeklyRitual: React.FC = () => {
    const { lifeItems, habits, addOrUpdateLifeItem } = useAppContext();
    const { addToast } = useToast();
    const { closeModal } = useModal();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    
    // Step 1 Data
    const [pastWeekSummary, setPastWeekSummary] = useState({ completedGoals: 0, habits: [] as {name: string, performance: string}[] });
    
    // Step 2 Data
    const [upcomingGoals, setUpcomingGoals] = useState<string[]>([]);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
    const [customPriority, setCustomPriority] = useState('');

    useEffect(() => {
        // --- Prepare data for the ritual ---
        const now = dayjs();
        const sevenDaysAgo = now.subtract(7, 'days');
        const sevenDaysAhead = now.add(7, 'days');

        // Past week data
        const pastWeekItems = lifeItems.filter(i => dayjs(i.updatedAt).isAfter(sevenDaysAgo));
        const completedGoals = pastWeekItems.filter(i => i.type === 'goal' && i.subtasks?.every(s => s.completed)).length;
        const habitPerformance = habits.map(h => {
            const pastWeekLogs = h.log.filter(l => dayjs(l).isAfter(sevenDaysAgo)).length;
            return { name: h.name, performance: `${pastWeekLogs}/7` };
        });
        setPastWeekSummary({ completedGoals, habits: habitPerformance });
        
        // Upcoming week data
        const goalsForNextWeek = lifeItems.filter(i => i.type === 'goal' && dayjs(i.dateISO).isBetween(now, sevenDaysAhead)).map(i => i.title);
        setUpcomingGoals(goalsForNextWeek);
        
        // --- Fetch AI suggestions ---
        const summaryText = `Completed ${completedGoals} goals. Habit performance: ${habitPerformance.map(h => `${h.name} ${h.performance}`).join(', ')}.`;
        generateWeeklyPlanningSuggestions(summaryText, goalsForNextWeek)
            .then(result => {
                setAiSuggestions(result.priorities);
                setSelectedPriorities(result.priorities); // Pre-select all suggestions
            })
            .catch(err => {
                addToast(err.message, 'error');
                setAiSuggestions([]);
            })
            .finally(() => setIsLoading(false));

    }, [lifeItems, habits]);
    
    const handleTogglePriority = (priority: string) => {
        setSelectedPriorities(prev => 
            prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
        );
    };

    const handleAddCustomPriority = () => {
        if (customPriority.trim() && !selectedPriorities.includes(customPriority.trim())) {
            setSelectedPriorities(prev => [...prev, customPriority.trim()]);
            setCustomPriority('');
        }
    };
    
    const handleActivatePlan = async () => {
        if(selectedPriorities.length === 0) {
            addToast("გთხოვთ, აირჩიოთ მინიმუმ ერთი პრიორიტეტი.", "info");
            return;
        }

        setIsLoading(true);
        try {
            const nextMonday = dayjs().day(1).add(1, 'week').format('YYYY-MM-DD');
            const promises = selectedPriorities.map(priority => 
                addOrUpdateLifeItem({
                    type: 'goal',
                    title: priority,
                    dateISO: dayjs(nextMonday).toISOString(), // Set deadline for end of next week
                    category: 'personal',
                    payload: { details: 'ყოველკვირეული დაგეგმვის რიტუალიდან დამატებული.' }
                })
            );
            await Promise.all(promises);
            addToast(`კვირის გეგმა გააქტიურდა! ${promises.length} ახალი ამოცანა დაემატა.`, 'success');
            closeModal();
        } catch (error) {
            addToast("გეგმის გააქტიურებისას მოხდა შეცდომა.", 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderStep1 = () => (
        <div>
            <h3 className="text-xl font-semibold mb-4">⏪ ნაბიჯი 1: გასული კვირის მიმოხილვა</h3>
            <div className="space-y-3 bg-black/20 p-4 rounded-lg">
                <p><strong>შესრულებული მიზნები:</strong> {pastWeekSummary.completedGoals}</p>
                <div>
                    <strong>ჩვევების პროგრესი:</strong>
                    <ul className="list-disc pl-5 mt-1 text-sm">
                       {pastWeekSummary.habits.map(h => <li key={h.name}>{h.name}: <span className="font-bold">{h.performance}</span></li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
    
    const renderStep2 = () => (
        <div>
            <h3 className="text-xl font-semibold mb-4">🎯 ნაბიჯი 2: პრიორიტეტების განსაზღვრა</h3>
            {isLoading ? <div className="text-center p-8"><span className="loader"></span></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold mb-2">AI რეკომენდაციები</h4>
                        <div className="space-y-2">
                            {aiSuggestions.map((s, i) => (
                                <div key={i} className="flex items-center bg-black/20 p-2 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id={`suggestion-${i}`}
                                        checked={selectedPriorities.includes(s)}
                                        onChange={() => handleTogglePriority(s)}
                                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-brand-color focus:ring-brand-color"
                                    />
                                    <label htmlFor={`suggestion-${i}`} className="ml-3 flex-grow text-sm">{s}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">ჩემი პრიორიტეტები</h4>
                         <div className="flex">
                            <input 
                                type="text" 
                                value={customPriority} 
                                onChange={e => setCustomPriority(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleAddCustomPriority()}
                                className="w-full p-2 bg-black/30 border-white/10 rounded-l-md" 
                                placeholder="დაამატე საკუთარი პრიორიტეტი..."
                            />
                            <button onClick={handleAddCustomPriority} className="p-2 bg-brand-color text-black rounded-r-md font-bold">+</button>
                        </div>
                        <div className="mt-2 space-y-2">
                             {selectedPriorities.filter(p => !aiSuggestions.includes(p)).map((p, i) => (
                                <div key={i} className="flex items-center justify-between bg-black/20 p-2 rounded-lg text-sm">
                                   <span>{p}</span>
                                   <button onClick={() => handleTogglePriority(p)} className="text-red-500 font-bold">&times;</button>
                                </div>
                             ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

     const renderStep3 = () => (
        <div>
            <h3 className="text-xl font-semibold mb-4">✅ ნაბიჯი 3: დადასტურება</h3>
             <p className="text-sm text-gray-400 mb-4">ეს არის თქვენი პრიორიტეტები მომდევნო კვირისთვის. დადასტურების შემდეგ, ისინი დაემატება თქვენს მიზნების სიას.</p>
            <div className="bg-black/20 p-4 rounded-lg">
                <ul className="list-disc pl-5 space-y-1">
                    {selectedPriorities.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
            </div>
        </div>
    );
    
    return (
        <div className="p-2">
            <h2 className="text-2xl font-bold accent-text mb-2 text-center">ყოველკვირეული დაგეგმვის რიტუალი</h2>
            <div className="flex justify-center items-center my-4">
                {[1, 2, 3].map(s => (
                     <React.Fragment key={s}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= s ? 'bg-brand-color border-brand-color text-black' : 'border-gray-500 text-gray-400'}`}>
                            {s}
                        </div>
                        {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-brand-color' : 'bg-gray-600'}`}></div>}
                    </React.Fragment>
                ))}
            </div>

            <div className="min-h-[300px] flex items-center justify-center">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
            
            <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg disabled:opacity-50">უკან</button>
                {step < 3 && <button onClick={() => setStep(s => Math.min(3, s + 1))} className="p-2 bg-brand-color hover:bg-brand-color/80 text-black rounded-lg">შემდეგი</button>}
                {step === 3 && <button onClick={handleActivatePlan} disabled={isLoading} className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center disabled:opacity-50">
                     {isLoading && <span className="loader mr-2"></span>}
                    გეგმის გააქტიურება
                </button>}
            </div>
        </div>
    );
};

export default WeeklyRitual;
