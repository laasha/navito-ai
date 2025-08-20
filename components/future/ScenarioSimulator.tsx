
import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { simulateScenario } from '../../services/geminiService';
import { Scenario } from '../../types';

const ScenarioSimulator: React.FC = () => {
    const { addToast } = useToast();
    const [scenarioDesc, setScenarioDesc] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<Scenario | null>(null);

    const handleSimulate = async () => {
        if (!scenarioDesc.trim()) {
            addToast('გთხოვთ, აღწეროთ სცენარი.', 'error');
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const simulation = await simulateScenario(scenarioDesc);
            setResult(simulation);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClear = () => {
        setResult(null);
        setScenarioDesc('');
    }

    return (
        <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-2">"რა მოხდებოდა, თუ...?"</h3>
            <p className="text-sm text-gray-400 mb-4">გაათამაშეთ მომავლის სცენარები. AI დაგიგეგმავთ შესაძლო გზას.</p>

            {!result && (
                <div className="space-y-3">
                    <textarea 
                        value={scenarioDesc}
                        onChange={e => setScenarioDesc(e.target.value)}
                        className="w-full p-2 bg-black/30 border-white/10 rounded-md h-20"
                        placeholder="მაგ: რა მოხდებოდა, თუ კარიერას შევიცვლიდი და დეველოპერი გავხდებოდი?"
                    />
                    <button onClick={handleSimulate} disabled={isLoading} className="w-full p-2 bg-brand-color text-black rounded-lg font-semibold flex items-center justify-center disabled:opacity-50">
                         {isLoading && <span className="loader mr-2"></span>}
                         {isLoading ? 'სიმულაცია...' : 'სცენარის სიმულაცია 🚀'}
                    </button>
                </div>
            )}
            
            {result && (
                <div className="animate-fade-in">
                     <div className="bg-black/20 p-4 rounded-lg">
                        <h4 className="text-lg font-bold brand-text">{result.name}</h4>
                        <p className="text-xs text-gray-300 mt-1 mb-3">{result.description}</p>
                        
                        <div className="space-y-3 text-sm">
                           <div>
                                <h5 className="font-semibold text-accent-color">ეტაპები:</h5>
                                <ul className="list-disc pl-5 text-gray-300">
                                    {result.milestones.map((m, i) => <li key={i}><strong>{m.title}</strong> ({m.duration})</li>)}
                                </ul>
                           </div>
                           <div>
                                <h5 className="font-semibold text-accent-color">მოსალოდნელი გამოწვევები:</h5>
                                <ul className="list-disc pl-5 text-gray-300">
                                    {result.potentialChallenges.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                           </div>
                            <div>
                                <h5 className="font-semibold text-accent-color">პირველი ნაბიჯები:</h5>
                                <ul className="list-disc pl-5 text-gray-300">
                                    {result.firstSteps.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                           </div>
                        </div>
                    </div>
                    <button onClick={handleClear} className="w-full mt-4 p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm">გასუფთავება</button>
                </div>
            )}
        </div>
    );
};

export default ScenarioSimulator;