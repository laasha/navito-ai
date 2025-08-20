import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { generateProjectPremortem } from '../../services/geminiService';

const ProjectPremortem: React.FC = () => {
    const { addToast } = useToast();
    const [project, setProject] = useState('');
    const [risks, setRisks] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!project.trim()) {
            addToast('გთხოვთ, აღწეროთ პროექტი.', 'error');
            return;
        }
        setIsLoading(true);
        setRisks([]);
        try {
            const result = await generateProjectPremortem(project);
            setRisks(result.risks);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">პროექტის პრემორტემი</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">წარმოიდგინეთ, რომ პროექტი ჩავარდა. AI დაგეხმარებათ, იპოვოთ შესაძლო მიზეზები, სანამ დაიწყებთ.</p>
            
            <textarea
                value={project}
                onChange={e => setProject(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md h-20 mb-3"
                placeholder="პროექტის მოკლე აღწერა..."
            />
            <button onClick={handleAnalyze} disabled={isLoading} className="w-full p-2 bg-accent-color text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isLoading ? <span className="loader mr-2"></span> : '🧐'}
                რისკების ანალიზი
            </button>
            
            {risks.length > 0 && (
                <div className="mt-4 space-y-2 animate-fade-in max-h-48 overflow-y-auto pr-2">
                    <h4 className="font-semibold text-sm">შესაძლო რისკები:</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-300">
                        {risks.map((risk, index) => <li key={index}>{risk}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProjectPremortem;
