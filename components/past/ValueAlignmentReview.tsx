
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { generateValueAlignmentSummary } from '../../services/geminiService';
import dayjs from 'dayjs';

const ValueAlignmentReview: React.FC = () => {
    const { lifeItems, userSettings } = useAppContext();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState('');

    const alignmentData = useMemo(() => {
        const { values } = userSettings;
        if (!values || values.length === 0) return null;

        const thirtyDaysAgo = dayjs().subtract(30, 'days');
        const completedGoals = lifeItems.filter(item =>
            item.type === 'goal' &&
            item.subtasks && item.subtasks.length > 0 && item.subtasks.every(st => st.completed) &&
            dayjs(item.updatedAt).isAfter(thirtyDaysAgo) 
        );

        const valueCounts = values.map(value => {
            const count = completedGoals.filter(goal => 
                goal.payload?.alignedValues?.includes(value.id)
            ).length;
            return { valueName: value.value, count };
        });

        return valueCounts;
    }, [lifeItems, userSettings]);

    const handleGenerate = async () => {
        if (!alignmentData || alignmentData.every(d => d.count === 0)) {
            addToast('ბოლო 30 დღეში დასრულებული და ღირებულებებზე მიბმული მიზნები ვერ მოიძებნა.', 'info');
            return;
        }
        setIsLoading(true);
        try {
            const result = await generateValueAlignmentSummary(alignmentData);
            setSummary(result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'));
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!userSettings.values || userSettings.values.length === 0) {
        return null; 
    }

    return (
        <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">ღირებულებებთან შესაბამისობა</h3>
            <p className="text-sm text-gray-400 mb-4">გააანალიზეთ, რამდენად შეესაბამება თქვენი ბოლო მოქმედებები (დასრულებული მიზნები) თქვენს მთავარ ღირებულებებს.</p>
            
            {alignmentData && (
                <div className="space-y-2 mb-4">
                    {alignmentData.map(data => (
                        <div key={data.valueName} className="flex justify-between items-center text-sm bg-black/20 p-2 rounded-lg">
                            <span className="font-semibold text-gray-300">{data.valueName}</span>
                            <span className="px-2 py-0.5 bg-brand-color/20 text-brand-color rounded-md">{data.count} მიზანი</span>
                        </div>
                    ))}
                </div>
            )}
            
            <button onClick={handleGenerate} disabled={isLoading} className="w-full p-2 bg-accent-color text-white rounded-lg text-sm font-semibold flex items-center justify-center disabled:opacity-50">
                {isLoading && <span className="loader mr-2"></span>}
                {isLoading ? 'ანალიზი...' : 'AI ანალიზის გენერაცია ✨'}
            </button>
            
            {summary && (
                <div 
                    className="mt-6 p-4 bg-black/20 rounded-lg min-h-[100px] prose prose-invert"
                    dangerouslySetInnerHTML={{ __html: summary }}
                ></div>
            )}
        </div>
    );
};

export default ValueAlignmentReview;
