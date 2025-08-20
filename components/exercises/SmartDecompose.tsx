
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import ExerciseWrapper from './ExerciseWrapper';
import { useAppContext } from '../../context/AppContext';
import { LifeItem, Subtask } from '../../types';
import { useToast } from '../../context/ToastContext';
import { generateSmartDecomposition } from '../../services/geminiService';
import SubtaskEditor from '../modal/SubtaskEditor';

interface SmartData {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
}

const SmartDecompose: React.FC<{ initialData: LifeItem | null }> = ({ initialData }) => {
    const { addOrUpdateLifeItem } = useAppContext();
    const { addToast } = useToast();
    
    const [goalTitle, setGoalTitle] = useState('');
    const [data, setData] = useState<SmartData>({
        specific: '', measurable: '', achievable: '', relevant: '',
        timeBound: dayjs().add(1, 'month').format('YYYY-MM-DD'),
    });
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [isDecomposed, setIsDecomposed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialData?.payload) {
            setGoalTitle(String(initialData.payload.goalTitle || initialData.title.replace('SMART მიზანი: ', '')));
            setData({
                specific: String(initialData.payload.specific || ''),
                measurable: String(initialData.payload.measurable || ''),
                achievable: String(initialData.payload.achievable || ''),
                relevant: String(initialData.payload.relevant || ''),
                timeBound: dayjs(initialData.dateISO).format('YYYY-MM-DD') || dayjs().add(1, 'month').format('YYYY-MM-DD'),
            });
            setSubtasks(initialData.subtasks || []);
            setIsDecomposed(true); // Show the full form if there's data
        }
    }, [initialData]);

    const handleChange = (field: keyof SmartData, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleDecompose = async () => {
        if (!goalTitle.trim()) {
            addToast('გთხოვთ, შეიყვანოთ მიზნის სათაური.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const result = await generateSmartDecomposition(goalTitle);
            setData(prev => ({
                ...prev,
                specific: result.specific,
                measurable: result.measurable,
                achievable: result.achievable,
                relevant: result.relevant,
            }));
            setSubtasks(result.subtasks.map(text => ({ text, completed: false })));
            setIsDecomposed(true);
            addToast('მიზანი წარმატებით დაიშალა!', 'success');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = async () => {
        await addOrUpdateLifeItem({
            id: initialData?.id || undefined,
            type: 'goal',
            title: `SMART მიზანი: ${goalTitle || 'უსათაურო'}`,
            dateISO: dayjs(data.timeBound).toISOString(),
            category: 'personal',
            payload: { 
                slug: 'smart-decompose', 
                goalTitle, // save the original title
                specific: data.specific,
                measurable: data.measurable,
                achievable: data.achievable,
                relevant: data.relevant,
            },
            subtasks: subtasks,
        });
    };
    
    const handleReset = () => {
        setGoalTitle('');
        setData({ specific: '', measurable: '', achievable: '', relevant: '', timeBound: dayjs().add(1, 'month').format('YYYY-MM-DD') });
        setSubtasks([]);
        setIsDecomposed(false);
        setIsLoading(false);
    };

    return (
        <ExerciseWrapper
            slug="smart-decompose"
            title="SMART მიზნის დაშლა"
            description="დაშალე მიზანი SMART კრიტერიუმებით."
            initialData={initialData}
            gatherData={() => ({ ...data, goalTitle, subtasks })}
            onSave={() => handleSave()}
            onReset={handleReset}
        >
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium">მიზნის სათაური:</label>
                    <div className="flex items-center gap-2 mt-1">
                        <input 
                            type="text" 
                            value={goalTitle} 
                            onChange={e => setGoalTitle(e.target.value)} 
                            className="w-full p-2 bg-black/30 border-white/10 rounded-md"
                            placeholder="მაგ: ვისწავლო გიტარაზე დაკვრა"
                        />
                        <button onClick={handleDecompose} disabled={isLoading || isDecomposed} className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50 flex-shrink-0">
                            {isLoading ? <span className="loader !w-4 !h-4"></span> : '✨'}
                        </button>
                    </div>
                </div>

                {isDecomposed && (
                    <div className="space-y-3 animate-fade-in">
                        <div><label className="text-sm">Specific (კონკრეტული):</label><textarea value={data.specific} onChange={e => handleChange('specific', e.target.value)} className="w-full mt-1 p-2 bg-black/30 border-white/10 rounded-md h-16"></textarea></div>
                        <div><label className="text-sm">Measurable (გაზომვადი):</label><textarea value={data.measurable} onChange={e => handleChange('measurable', e.target.value)} className="w-full mt-1 p-2 bg-black/30 border-white/10 rounded-md h-16"></textarea></div>
                        <div><label className="text-sm">Achievable (მიღწევადი):</label><textarea value={data.achievable} onChange={e => handleChange('achievable', e.target.value)} className="w-full mt-1 p-2 bg-black/30 border-white/10 rounded-md h-16"></textarea></div>
                        <div><label className="text-sm">Relevant (რელევანტური):</label><textarea value={data.relevant} onChange={e => handleChange('relevant', e.target.value)} className="w-full mt-1 p-2 bg-black/30 border-white/10 rounded-md h-16"></textarea></div>
                        <div><label className="text-sm">Time-bound (დროში განსაზღვრული):</label><input type="date" value={data.timeBound} onChange={e => handleChange('timeBound', e.target.value)} className="w-full mt-1 p-2 bg-black/30 border-white/10 rounded-md"/></div>
                        
                        <div className="pt-2">
                             <SubtaskEditor subtasks={subtasks} setSubtasks={setSubtasks} />
                        </div>
                    </div>
                )}
            </div>
        </ExerciseWrapper>
    );
};

export default SmartDecompose;
