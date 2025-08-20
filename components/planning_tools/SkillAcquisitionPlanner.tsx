import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { planSkillAcquisition } from '../../services/geminiService';
import { SkillPlanResponse } from '../../types';

const SkillAcquisitionPlanner: React.FC = () => {
    const { addToast } = useToast();
    const [skill, setSkill] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SkillPlanResponse | null>(null);

    const handleGenerate = async () => {
        if (!skill.trim()) {
            addToast('გთხოვთ, ჩაწეროთ უნარი, რომლის სწავლაც გსურთ.', 'error');
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const response = await planSkillAcquisition(skill);
            setResult(response);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">უნარის ათვისების გეგმა</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">შექმენით სტრუქტურირებული გეგმა ახალი უნარის ასათვისებლად, დაყოფილი ფაზებად და კონკრეტულ აქტივობებად.</p>
            
            <input
                type="text"
                value={skill}
                onChange={e => setSkill(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md mb-3"
                placeholder="მაგ: Python, ფოტოგრაფია, საჯარო გამოსვლები..."
            />
            <button onClick={handleGenerate} disabled={isLoading} className="w-full p-2 bg-accent-color text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isLoading ? <span className="loader mr-2"></span> : '🎓'}
                გეგმის შექმნა
            </button>
            
            {result && (
                <div className="mt-4 space-y-3 animate-fade-in max-h-60 overflow-y-auto pr-2">
                    <h4 className="font-bold text-lg">{result.planName}</h4>
                    {result.phases.map((phase, index) => (
                        <div key={index} className="bg-black/20 p-3 rounded-lg">
                           <p className="font-bold text-brand-color">{phase.phaseTitle} ({phase.duration})</p>
                           <ul className="list-disc pl-5 mt-1 text-sm text-gray-300">
                                {phase.activities.map((activity, i) => <li key={i}>{activity}</li>)}
                           </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SkillAcquisitionPlanner;
