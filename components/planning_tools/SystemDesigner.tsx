import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { designPersonalSystem } from '../../services/geminiService';
import { PersonalSystem, SystemComponent } from '../../types';

const SystemComponentIcon: React.FC<{ type: SystemComponent['type'] }> = ({ type }) => {
    switch (type) {
        case 'habit': return <span title="Habit" className="text-xl">🏃‍♂️</span>;
        case 'task': return <span title="Task" className="text-xl">✔️</span>;
        case 'reflection': return <span title="Reflection" className="text-xl">🤔</span>;
        default: return null;
    }
};

const SystemDesigner: React.FC = () => {
    const { habits, saveHabits, addOrUpdateLifeItem } = useAppContext();
    const { addToast } = useToast();
    const [problem, setProblem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    const [system, setSystem] = useState<PersonalSystem | null>(null);

    const handleDesign = async () => {
        if (!problem.trim()) {
            addToast('გთხოვთ, აღწეროთ პრობლემა ან მიზანი.', 'error');
            return;
        }
        setIsLoading(true);
        setSystem(null);
        try {
            const result = await designPersonalSystem(problem);
            setSystem(result);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleActivate = async () => {
        if (!system) return;
        setIsActivating(true);
        try {
            // 1. Add new habits
            const existingHabits = habits;
            const newHabitsFromSystem = system.components
                .filter(c => c.type === 'habit')
                .map(c => ({
                    id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: c.title,
                    log: [],
                }));
            
            if (newHabitsFromSystem.length > 0) {
                 await saveHabits([...existingHabits, ...newHabitsFromSystem]);
            }

            // 2. Create the main goal with tasks and reflections
            const tasks = system.components
                .filter(c => c.type === 'task')
                .map(c => ({ text: c.title, completed: false }));

            const reflections = system.components.filter(c => c.type === 'reflection');
            let details = system.description;
            if (reflections.length > 0) {
                details += '\n\n**რეფლექსიის კითხვები:**\n' + reflections.map(r => `- ${r.title}`).join('\n');
            }

            await addOrUpdateLifeItem({
                type: 'goal',
                title: system.name,
                dateISO: dayjs().add(30, 'days').toISOString(), // Default 30-day deadline
                category: 'personal',
                payload: { details },
                subtasks: tasks,
            });

            addToast(`სისტემა "${system.name}" გააქტიურდა!`, 'success');
            handleClear();

        } catch (error: any) {
            addToast('სისტემის გააქტიურებისას მოხდა შეცდომა.', 'error');
        } finally {
            setIsActivating(false);
        }
    };
    
    const handleClear = () => {
        setSystem(null);
        setProblem('');
    };

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">სისტემის დიზაინერი</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">აღწერეთ პრობლემა ან მიზანი და AI შექმნის თქვენთვის პერსონალურ სამოქმედო გეგმას.</p>
            
            {!system ? (
                 <div className="space-y-3">
                    <textarea 
                        value={problem}
                        onChange={e => setProblem(e.target.value)}
                        className="w-full p-2 bg-black/30 border-white/10 rounded-md h-24"
                        placeholder="მაგ: მინდა დავამარცხო პროკრასტინაცია..."
                    />
                    <button onClick={handleDesign} disabled={isLoading} className="w-full p-2 bg-accent-color text-white rounded-lg font-semibold flex items-center justify-center disabled:opacity-50">
                         {isLoading && <span className="loader mr-2"></span>}
                         {isLoading ? 'სისტემა იქმნება...' : 'სისტემის დიზაინი ✨'}
                    </button>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <div className="bg-black/20 p-4 rounded-lg max-h-60 overflow-y-auto pr-2">
                        <h4 className="text-2xl font-bold brand-text">{system.name}</h4>
                        <p className="text-sm text-gray-300 mt-2 mb-4">{system.description}</p>
                        
                        <div className="space-y-3">
                            {system.components.map((component, index) => (
                                <div key={index} className="flex items-start gap-3 p-2 bg-black/20 rounded">
                                    <SystemComponentIcon type={component.type} />
                                    <div>
                                        <p className="font-semibold">{component.title}</p>
                                        <p className="text-xs text-gray-400">{component.details}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 flex gap-4">
                        <button onClick={handleActivate} disabled={isActivating} className="flex-1 p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold flex items-center justify-center disabled:opacity-50">
                            {isActivating && <span className="loader mr-2"></span>}
                            {isActivating ? 'აქტივაცია...' : 'გააქტიურება'}
                        </button>
                        <button onClick={handleClear} className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg">გასუფთავება</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemDesigner;
