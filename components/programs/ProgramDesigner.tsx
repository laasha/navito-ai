

import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { designGuidedJourney } from '../../services/geminiService';
import { Program, ProgramComponent } from '../../types';

const ProgramComponentIcon: React.FC<{ type: ProgramComponent['type'] }> = ({ type }) => {
    switch (type) {
        case 'habit': return <span title="Habit" className="text-xl">🏃‍♂️</span>;
        case 'goal': return <span title="Goal" className="text-xl">🎯</span>;
        case 'exercise': return <span title="Exercise" className="text-xl">🧘</span>;
        default: return null;
    }
};

const ProgramDesigner: React.FC = () => {
    const { activateProgram } = useAppContext();
    const { addToast } = useToast();
    const [goal, setGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [program, setProgram] = useState<Omit<Program, 'id' | 'isActive' | 'startDate' | 'checkins'> | null>(null);

    const handleDesign = async () => {
        if (!goal.trim()) {
            addToast('გთხოვთ, აღწეროთ თქვენი მიზანი.', 'error');
            return;
        }
        setIsLoading(true);
        setProgram(null);
        try {
            const result = await designGuidedJourney(goal);
            setProgram(result);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleActivate = async () => {
        if (!program) return;
        try {
            await activateProgram(program);
            addToast(`პროგრამა "${program.name}" წარმატებით გააქტიურდა!`, 'success');
            setProgram(null);
            setGoal('');
        } catch (error) {
            addToast('პროგრამის გააქტიურებისას მოხდა შეცდომა.', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="glass-effect rounded-xl p-8 text-center">
                <div className="loader inline-block w-12 h-12 border-4 mb-4"></div>
                <p className="text-lg text-gray-300 animate-pulse">თქვენი პერსონალური პროგრამა იქმნება...</p>
                <p className="text-sm text-gray-500">ამას შეიძლება 30 წამამდე დასჭირდეს.</p>
            </div>
        );
    }
    
    if (program) {
        return (
            <div className="glass-effect rounded-xl p-6 animate-fade-in">
                <h2 className="text-2xl font-bold brand-text">{program.name}</h2>
                <p className="text-sm text-gray-400 mt-1 mb-4">{program.description} ({program.durationWeeks} კვირა)</p>
                
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {Array.from({ length: program.durationWeeks }, (_, i) => i + 1).map(week => (
                        <div key={week}>
                            <h3 className="text-lg font-semibold accent-text mb-2">კვირა {week}</h3>
                            <div className="space-y-2 border-l-2 border-white/10 pl-4">
                                {program.components.filter(c => c.week === week).map((component, index) => (
                                    <div key={index} className="flex items-start gap-3 p-2 bg-black/20 rounded">
                                        <ProgramComponentIcon type={component.type} />
                                        <div>
                                            <p className="font-semibold">{component.title}</p>
                                            <p className="text-xs text-gray-400">{component.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex gap-4">
                    <button onClick={handleActivate} className="flex-1 p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold">პროგრამის გააქტიურება 🚀</button>
                    <button onClick={() => setProgram(null)} className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg">უკან</button>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">პროგრამის დიზაინერი</h2>
            <p className="text-sm text-gray-400 mb-4">აღწერეთ თქვენი მიზანი და მიიღეთ სტრუქტურირებული გეგმა.</p>
            <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md h-24"
                placeholder="მაგ: მინდა გავხდე უკეთესი საჯარო გამომსვლელი და მოვემზადო პრეზენტაციისთვის 3 თვეში."
            />
            <button onClick={handleDesign} className="w-full mt-3 p-2 bg-accent-color text-white rounded-lg font-semibold">
                პროგრამის შექმნა ✨
            </button>
        </div>
    );
};

export default ProgramDesigner;