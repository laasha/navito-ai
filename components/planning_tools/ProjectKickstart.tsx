import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { generateProjectKickstart } from '../../services/geminiService';
import { ProjectKickstartResponse } from '../../types';

const ProjectKickstart: React.FC = () => {
    const { addToast } = useToast();
    const [project, setProject] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ProjectKickstartResponse | null>(null);

    const handleGenerate = async () => {
        if (!project.trim()) {
            addToast('გთხოვთ, აღწეროთ პროექტი.', 'error');
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const response = await generateProjectKickstart(project);
            setResult(response);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="glass-effect rounded-xl p-6 shadow-md flex flex-col h-full">
            <h3 className="text-xl font-semibold brand-text mb-2">პროექტის დასაწყისი</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">მიიღეთ პროექტის მოკლე აღწერა, ძირითადი ამოცანები და ვადები, რათა სწრაფად დაიწყოთ მოქმედება.</p>
            
            <textarea
                value={project}
                onChange={e => setProject(e.target.value)}
                className="w-full p-2 bg-black/30 border-white/10 rounded-md h-20 mb-3"
                placeholder="პროექტის იდეა, მაგ: ბლოგის შექმნა..."
            />
            <button onClick={handleGenerate} disabled={isLoading} className="w-full p-2 bg-accent-color text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isLoading ? <span className="loader mr-2"></span> : '🚀'}
                გეგმის გენერაცია
            </button>
            
            {result && (
                <div className="mt-4 space-y-3 animate-fade-in max-h-60 overflow-y-auto pr-2">
                    <h4 className="font-bold text-lg">{result.projectName}</h4>
                    <p className="text-sm italic bg-black/20 p-2 rounded">{result.brief}</p>
                    <div>
                        <h5 className="font-semibold">ძირითადი ამოცანები:</h5>
                        <ul className="list-disc pl-5 text-sm">
                            {result.keyTasks.map((task, i) => <li key={i}>{task}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectKickstart;
